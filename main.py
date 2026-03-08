import streamlit as st
import pandas as pd
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

st.set_page_config(page_title="Pharmacy BI Copilot", page_icon="📊")
st.title("📊 Pharmacy Business Intelligence Copilot")
st.caption("Ask any question about your pharmacy sales data in plain English.")

uploaded_file = st.file_uploader("Upload your daily sales Excel file", type=["xlsx", "csv"])

if uploaded_file:
    if uploaded_file.name.endswith(".csv"):
        df = pd.read_csv(uploaded_file)
    else:
        df = pd.read_excel(uploaded_file)

    df["Bill Date"] = pd.to_datetime(df["Bill Date"], dayfirst=True, errors="coerce")
    df = df.sort_values("Bill Date")

    with st.sidebar:
        st.header("Data Loaded")
        st.metric("Days of data", len(df))
        st.metric("Date range", f"{df['Bill Date'].min().strftime('%d %b %Y')} to {df['Bill Date'].max().strftime('%d %b %Y')}")
        st.metric("Total Revenue", f"Rs {df['Net Amount'].sum():,.0f}")
        st.metric("Avg Daily Revenue", f"Rs {df['Net Amount'].mean():,.0f}")
        st.metric("Avg Margin", f"{df['Margin'].mean():.1f}%")

    st.markdown("### Quick Insights")
    col1, col2, col3 = st.columns(3)
    quick_question = None
    if col1.button("Sales trend"):
        quick_question = "Analyse my monthly sales trend. Which months are strongest and weakest? What is the overall trajectory?"
    if col2.button("Margin analysis"):
        quick_question = "Analyse my margin trends. When is my margin highest and lowest? What might be driving the variation?"
    if col3.button("Pharma vs Non-Pharma"):
        quick_question = "Compare my pharma vs non-pharma sales. What percentage is each? How has the split changed over time?"

    st.markdown("### Ask Your Data")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if quick_question:
        st.session_state.messages.append({"role": "user", "content": quick_question})
        with st.chat_message("user"):
            st.markdown(quick_question)

    user_input = st.chat_input("e.g. What is my best day of the week for sales?")
    if user_input:
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

    if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":
        monthly = df.groupby(df["Bill Date"].dt.to_period("M")).agg(
            total_sales=("Net Amount", "sum"),
            avg_daily_sales=("Net Amount", "mean"),
            avg_margin=("Margin", "mean"),
            pharma_sales=("Pharmasales", "sum"),
            non_pharma_sales=("NonPharmasales", "sum"),
            total_bills=("Total NoOfBills", "sum")
        ).reset_index()
        monthly["Bill Date"] = monthly["Bill Date"].astype(str)

        dow = df.copy()
        dow["day_of_week"] = dow["Bill Date"].dt.day_name()
        dow_summary = dow.groupby("day_of_week")["Net Amount"].mean().round(0).to_dict()

        data_context = f"""You are a business analyst for HAQ Pharmacy, Chennai. Answer the question using the data below.
Be specific with numbers. Use Rs for currency. Give actionable recommendations where relevant.
Keep answers concise — 3-5 paragraphs max.

MONTHLY SUMMARY:
{monthly.to_string(index=False)}

AVERAGE SALES BY DAY OF WEEK:
{dow_summary}

OVERALL STATS:
- Total days of data: {len(df)}
- Date range: {df['Bill Date'].min().strftime('%d %b %Y')} to {df['Bill Date'].max().strftime('%d %b %Y')}
- Total revenue: Rs {df['Net Amount'].sum():,.0f}
- Average daily revenue: Rs {df['Net Amount'].mean():,.0f}
- Average margin: {df['Margin'].mean():.1f}%
- Total pharma sales: Rs {df['Pharmasales'].sum():,.0f}
- Total non-pharma sales: Rs {df['NonPharmasales'].sum():,.0f}
- Pharma as % of total: {df['Pharmasales'].sum() / df['Value'].sum() * 100:.1f}%"""

        with st.chat_message("assistant"):
            with st.spinner("Analysing your data..."):
                response = client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=1000,
                    system=data_context,
                    messages=[{"role": m["role"], "content": m["content"]}
                               for m in st.session_state.messages]
                )
                answer = response.content[0].text
                st.markdown(answer)

        st.session_state.messages.append({"role": "assistant", "content": answer})

else:
    st.info("Upload your daily sales Excel file to get started.")
    st.markdown("**Example questions you can ask:**")
    st.markdown("- What is my best performing month?")
    st.markdown("- How has my margin trended over time?")
    st.markdown("- What percentage of my sales is pharma vs non-pharma?")
    st.markdown("- Which day of the week generates the most revenue?")
    st.markdown("- Am I growing year over year?")