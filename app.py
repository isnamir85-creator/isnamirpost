import streamlit as st
import google.generativeai as genai

# 1. 사이트 제목 설정
st.set_page_config(page_title="나의 AI 앱", layout="centered")
st.title("🤖 나만의 AI 비서")

# 2. API 키 설정 (보안을 위해 나중에 설정 창에서 입력)
api_key = st.secrets["GEMINI_API_KEY"]
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# 3. 채팅 기록 관리
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 4. 채팅 입력창
if prompt := st.chat_input("메시지를 입력하세요"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        response = model.generate_content(prompt)
        st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
