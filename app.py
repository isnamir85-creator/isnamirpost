import streamlit as st
import google.generativeai as genai

# 1. 페이지 설정 (브라우저 탭에 표시될 이름)
st.set_page_config(page_title="나만의 AI 앱", layout="centered")
st.title("🤖 무엇이든 물어보세요")

# 2. [중요] API 키 불러오기 
# 아까 Streamlit 'Secrets' 칸에 적은 GEMINI_API_KEY를 여기서 불러옵니다.
try:
    api_key = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=api_key)
except KeyError:
    st.error("에러: Streamlit Secrets에 'GEMINI_API_KEY'가 설정되지 않았습니다.")
    st.stop()

model = genai.GenerativeModel('gemini-1.5-flash')

# 3. 채팅 기록 초기화 및 표시
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 4. 사용자 입력 및 AI 답변 생성
if prompt := st.chat_input("메시지를 입력하세요"):
    # 사용자 메시지 저장 및 표시
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # AI 답변 생성 및 표시
    with st.chat_message("assistant"):
        try:
            response = model.generate_content(prompt)
            st.markdown(response.text)
            st.session_state.messages.append({"role": "assistant", "content": response.text})
        except Exception as e:
            st.error(f"AI 응답 생성 중 에러가 발생했습니다: {e}")
