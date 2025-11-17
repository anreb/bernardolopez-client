document.addEventListener("DOMContentLoaded", function () {
  const chatMessages = document.getElementById("chatMessages");
  const chatMessagesContent = document.querySelector(".chat-messages-content");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");
  const chatInputContainer = document.querySelector(".chat-input-container");

  if (!chatMessages || !chatMessagesContent || !chatInput || !sendButton) {
    return;
  }

  function initKeyboardAvoidance() {
    chatInput.addEventListener("focus", function () {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  initKeyboardAvoidance();

  function addMessage(content, isUser, isHtml = false) {
    try {
      const messageClass = isUser
        ? "message user-message"
        : "message bot-message";
      const messageDiv = document.createElement("div");
      messageDiv.className = messageClass;
      const messageContent = document.createElement("p");
      if (isHtml) {
        messageContent.innerHTML = content;
      } else {
        messageContent.textContent = content;
      }
      messageDiv.appendChild(messageContent);
      chatMessagesContent.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error("Error adding message:", error);
    }
  }

  function showTypingIndicator() {
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "message bot-message loading";
    const messageContent = document.createElement("p");
    messageContent.textContent = "Thinking...";
    loadingMessage.appendChild(messageContent);
    chatMessagesContent.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingMessage;
  }

  function removeTypingIndicator(loadingMessage) {
    loadingMessage.remove();
  }

  function initializeChat() {
    const loading1 = showTypingIndicator();
    setTimeout(function () {
      removeTypingIndicator(loading1);
      const aboutMeText =
        "Welcome to my portfolio! I'm a passionate developer with expertise in building scalable web applications and solving complex technical challenges. With years of experience in software development, I specialize in creating efficient, user-friendly solutions that make a difference.";
      addMessage(aboutMeText, false);

      setTimeout(function () {
        const loading2 = showTypingIndicator();
        setTimeout(function () {
          removeTypingIndicator(loading2);
          const resumeLink =
            'Feel free to check out my resume: <a href="resume.pdf" target="_blank" class="resume-link">Open Resume PDF</a>';
          addMessage(resumeLink, false, true);
        }, 1000);
      }, 100);
    }, 1000);
  }

  initializeChat();

  let scrollTimeout;
  chatMessages.addEventListener("scroll", function () {
    chatMessages.classList.add("scrolling");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      chatMessages.classList.remove("scrolling");
    }, 1000);
  });

  function sendMessage() {
    const question = chatInput.value.trim();
    if (!question) return;

    addMessage(question, true);
    chatInput.value = "";

    chatInput.disabled = true;
    sendButton.disabled = true;

    const loadingMessage = showTypingIndicator();

    fetch("https://api.bernardolopez.me/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        removeTypingIndicator(loadingMessage);

        const answer =
          data.answer || data.message || "I received your question!";
        addMessage(answer, false);
      })
      .catch(function (error) {
        console.error("Fetch error:", error);
        removeTypingIndicator(loadingMessage);

        let errorMessage =
          "Sorry, I encountered an error processing your question.";
        if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to the server. Please check your connection.";
        } else if (error.message.includes("status: 5")) {
          errorMessage = "Server error. Please try again later.";
        }
        addMessage(errorMessage, false);
      })
      .finally(function () {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
      });
  }

  sendButton.addEventListener("click", function (e) {
    e.preventDefault();
    sendMessage();
  });

  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
