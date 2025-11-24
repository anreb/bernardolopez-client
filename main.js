// Cookie Consent Management
(function () {
  var COOKIE_CONSENT_KEY = "cookieConsent";

  function loadGoogleAnalytics() {
    // Load gtag.js script
    var gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-EP0W3WXD39";
    document.head.appendChild(gtagScript);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-EP0W3WXD39");
  }

  function hideCookieBanner() {
    var banner = document.getElementById("cookieConsent");
    if (banner) {
      banner.classList.add("hiding");
      setTimeout(function () {
        banner.classList.add("hidden");
      }, 300);
    }
  }

  function handleCookieConsent(accepted) {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? "accepted" : "declined");
      if (accepted) {
        loadGoogleAnalytics();
      }
      hideCookieBanner();
    } catch (e) {
      // If localStorage fails, just hide the banner
      hideCookieBanner();
    }
  }

  function initCookieConsent() {
    var consent = null;
    try {
      consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      // LocalStorage not available
    }

    if (consent === "accepted") {
      loadGoogleAnalytics();
    } else if (consent === null) {
      // Show banner if no consent is stored
      var banner = document.getElementById("cookieConsent");
      if (banner) {
        banner.classList.remove("hidden");
      }
    }

    // Set up event listeners
    var acceptBtn = document.getElementById("acceptCookies");
    var declineBtn = document.getElementById("declineCookies");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        handleCookieConsent(true);
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        handleCookieConsent(false);
      });
    }
  }

  // Initialize cookie consent when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCookieConsent);
  } else {
    initCookieConsent();
  }
})();

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
            'Feel free to check out my resume: <a href="Bernardo%20Lopez%20Bautista%20Resume.pdf" target="_blank" rel="noopener noreferrer" class="resume-link">Open Resume PDF</a>';
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

  function sendMessage() {
    var question = chatInput.value.trim();
    if (!question) return;

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

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var answer = data.message || "I received your question!";
          addMessage(answer, false);
        } catch (e) {
          addMessage("Error parsing response: " + e.message, false);
        }
      } else {
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
            // Silently ignore error
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
