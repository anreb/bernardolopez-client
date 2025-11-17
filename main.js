document.addEventListener("DOMContentLoaded", function () {
  var chatMessages = document.getElementById("chatMessages");
  var chatMessagesContent = document.querySelector(".chat-messages-content");
  var chatInput = document.getElementById("chatInput");
  var sendButton = document.getElementById("sendButton");
  var chatInputContainer = document.querySelector(".chat-input-container");

  if (!chatMessages || !chatMessagesContent || !chatInput || !sendButton) {
    return;
  }

  function initKeyboardAvoidance() {
    chatInput.addEventListener("focus", function () {
      setTimeout(function () {
        window.scrollTo(0, document.documentElement.scrollHeight);
      }, 100);
    });
  }

  initKeyboardAvoidance();

  function addMessage(content, isUser, isHtml) {
    try {
      if (typeof isHtml === "undefined") {
        isHtml = false;
      }
      var messageClass = isUser
        ? "message user-message"
        : "message bot-message";
      var messageDiv = document.createElement("div");
      messageDiv.className = messageClass;
      var messageContent = document.createElement("p");
      if (isHtml) {
        messageContent.innerHTML = content;
      } else {
        messageContent.textContent = content;
      }
      messageDiv.appendChild(messageContent);
      chatMessagesContent.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      // Silently handle error - message won't be added
    }
  }

  function showTypingIndicator() {
    var loadingMessage = document.createElement("div");
    loadingMessage.className = "message bot-message loading";
    var messageContent = document.createElement("p");
    messageContent.textContent = "Thinking...";
    loadingMessage.appendChild(messageContent);
    chatMessagesContent.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingMessage;
  }

  function removeTypingIndicator(loadingMessage) {
    if (loadingMessage && loadingMessage.parentNode) {
      loadingMessage.parentNode.removeChild(loadingMessage);
    }
  }

  function initializeChat() {
    var loading1 = showTypingIndicator();
    setTimeout(function () {
      removeTypingIndicator(loading1);
      var aboutMeText =
        "Welcome to my portfolio! I'm a passionate developer with expertise in building scalable web applications and solving complex technical challenges. With years of experience in software development, I specialize in creating efficient, user-friendly solutions that make a difference.";
      addMessage(aboutMeText, false);

      setTimeout(function () {
        var loading2 = showTypingIndicator();
        setTimeout(function () {
          removeTypingIndicator(loading2);
          var resumeLink =
            'Feel free to check out my resume: <a href="resume.pdf" target="_blank" class="resume-link">Open Resume PDF</a>';
          addMessage(resumeLink, false, true);
        }, 1000);
      }, 100);
    }, 1000);
  }

  initializeChat();

  var scrollTimeout;
  chatMessages.addEventListener("scroll", function () {
    chatMessages.classList.add("scrolling");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      chatMessages.classList.remove("scrolling");
    }, 1000);
  });

  function showToast(message) {
    if (!document.body) {
      return;
    }
    var toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText =
      "position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #333; color: #fff; padding: 12px 24px; border-radius: 8px; z-index: 10000; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 80%;";
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  function sendMessage() {
    var question = chatInput.value.trim();
    if (!question) return;

    showToast("Sending: " + question.substring(0, 30));
    addMessage(question, true);
    chatInput.value = "";

    chatInput.disabled = true;
    sendButton.disabled = true;

    var loadingMessage = showTypingIndicator();

    // XMLHttpRequest for better mobile compatibility
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.bernardolopez.me/api/chat", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      removeTypingIndicator(loadingMessage);

      showToast("Status: " + xhr.status);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var answer = data.message || "I received your question!";
          addMessage(answer, false);
          showToast("Response received successfully");
        } catch (e) {
          showToast("Parse error: " + e.message);
          addMessage("Error parsing response: " + e.message, false);
        }
      } else {
        showToast("Error status: " + xhr.status);
        var errorMessage =
          "Sorry, I encountered an error processing your question. (Status: " +
          xhr.status +
          ")";
        if (xhr.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (xhr.status === 400) {
          try {
            var errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            showToast("Error parsing: " + e.message);
          }
        }
        addMessage(errorMessage, false);
      }

      chatInput.disabled = false;
      sendButton.disabled = false;

      // Wrap focus in try-catch for Chrome iOS compatibility
      try {
        chatInput.focus();
      } catch (e) {
        // Silently ignore focus errors
      }
    };

    xhr.onerror = function () {
      showToast("XHR Network Error - CORS or connection issue");
      removeTypingIndicator(loadingMessage);
      addMessage(
        "Unable to connect to the server. Please check your connection.",
        false
      );
      chatInput.disabled = false;
      sendButton.disabled = false;

      try {
        chatInput.focus();
      } catch (e) {
        // Silently ignore focus errors
      }
    };

    xhr.send(JSON.stringify({ message: question }));
  }

  sendButton.addEventListener("click", function (e) {
    e.preventDefault();
    sendMessage();
  });

  chatInput.addEventListener("keydown", function (e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
