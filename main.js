$(document).ready(function () {
  const chatMessages = $("#chatMessages");
  const chatMessagesContent = $(".chat-messages-content");
  const chatInput = $("#chatInput");
  const sendButton = $("#sendButton");
  const chatInputContainer = $(".chat-input-container");

  /**
   * Mobile Keyboard Avoidance Implementation
   *
   * Scrolls to bottom when chat input is focused to keep it visible above keyboard
   */
  function initKeyboardAvoidance() {
    chatInput.on("focus", function () {
      window.scrollTo(0, 300);
    });
  }

  // Initialize keyboard avoidance on page load
  initKeyboardAvoidance();

  function addMessage(content, isUser, isHtml = false) {
    const messageClass = isUser
      ? "message user-message"
      : "message bot-message";
    const messageDiv = $("<div>").addClass(messageClass);
    const messageContent = $("<p>");
    if (isHtml) {
      messageContent.html(content);
    } else {
      messageContent.text(content);
    }
    messageDiv.append(messageContent);
    chatMessagesContent.append(messageDiv);
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
  }

  function showTypingIndicator() {
    const loadingMessage = $("<div>").addClass("message bot-message loading");
    loadingMessage.append($("<p>").text("Thinking..."));
    chatMessagesContent.append(loadingMessage);
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
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
  chatMessages.on("scroll", function () {
    chatMessages.addClass("scrolling");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      chatMessages.removeClass("scrolling");
    }, 1000);
  });

  function sendMessage() {
    const question = chatInput.val().trim();
    if (!question) return;

    addMessage(question, true);
    chatInput.val("");

    chatInput.prop("disabled", true);
    sendButton.prop("disabled", true);

    const loadingMessage = showTypingIndicator();

    $.ajax({
      url: "https://api.bernardolopez.me/api/chat",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ question: question }),
      success: function (response) {
        removeTypingIndicator(loadingMessage);

        const answer =
          response.answer || response.message || "I received your question!";
        addMessage(answer, false);
      },
      error: function (xhr, status, error) {
        removeTypingIndicator(loadingMessage);

        let errorMessage =
          "Sorry, I encountered an error processing your question.";
        if (xhr.status === 0) {
          errorMessage =
            "Unable to connect to the server. Please check your connection.";
        } else if (xhr.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
        addMessage(errorMessage, false);
      },
      complete: function () {
        chatInput.prop("disabled", false);
        sendButton.prop("disabled", false);
        chatInput.focus();
      },
    });
  }

  sendButton.on("click", sendMessage);

  chatInput.on("keypress", function (e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
