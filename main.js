$(document).ready(function () {
  const chatMessages = $("#chatMessages");
  const chatMessagesContent = $(".chat-messages-content");
  const chatInput = $("#chatInput");
  const sendButton = $("#sendButton");
  const chatInputContainer = $(".chat-input-container");

  /**
   * Mobile Keyboard Avoidance Implementation
   *
   * Ensures chat input stays visible above the mobile keyboard on:
   * - iOS Safari, iOS Chrome, Android Chrome
   *
   * Uses visualViewport API (modern) with window.resize fallback (legacy)
   */
  function initKeyboardAvoidance() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (!isMobile) {
      return;
    }

    let initialViewportHeight = window.innerHeight;

    // Modern approach: Visual Viewport API (iOS 13+, Chrome 61+)
    if (window.visualViewport) {
      /**
       * Updates input position when keyboard opens/closes
       * Calculates distance from bottom based on visible viewport
       */
      let isAdjustingScroll = false;

      const updateInputPosition = () => {
        if (isAdjustingScroll) return;

        const viewport = window.visualViewport;
        const viewportHeight = viewport.height;
        const offsetTop = viewport.offsetTop;

        // Calculate how far keyboard pushes content up
        const visualBottom = window.innerHeight - (viewportHeight + offsetTop);

        // Move input container above keyboard
        chatInputContainer.css("bottom", `${visualBottom}px`);

        // Scroll window down to keep input visible above keyboard
        if (visualBottom > 0) {
          isAdjustingScroll = true;
          setTimeout(() => {
            const inputRect = chatInputContainer[0].getBoundingClientRect();
            const inputBottom = inputRect.bottom;

            // If input is below visible viewport, scroll down
            if (inputBottom > viewportHeight) {
              const scrollAmount = inputBottom - viewportHeight + 20;
              window.scrollBy(0, scrollAmount);
            }

            setTimeout(() => {
              isAdjustingScroll = false;
            }, 200);
          }, 50);
        }
      };

      // Listen for viewport changes (keyboard open/close)
      // Only use resize, not scroll to avoid feedback loops
      window.visualViewport.addEventListener("resize", updateInputPosition);

      // Update position when input gains focus
      // Multiple timeouts handle different keyboard animation speeds
      chatInput.on("focus", function () {
        setTimeout(updateInputPosition, 100);
        setTimeout(updateInputPosition, 300);
      });

      // Reset position when keyboard closes
      chatInput.on("blur", function () {
        setTimeout(() => {
          chatInputContainer.css("bottom", "0px");
        }, 100);
      });
    } else {
      // Fallback approach: window.resize (older browsers)
      /**
       * Detects keyboard by viewport height change
       * If viewport shrinks >150px, keyboard is likely open
       */
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;

        // Keyboard detection threshold: 150px viewport shrinkage
        if (heightDiff > 150) {
          chatInputContainer.css("bottom", "0px");

          // Scroll window down to keep input visible
          // setTimeout(() => {
          //   const inputRect = chatInputContainer[0].getBoundingClientRect();
          //   const inputBottom = inputRect.bottom;
          //   const viewportHeight = window.innerHeight;

          //   // If input is below visible viewport, scroll down
          //   if (inputBottom > viewportHeight) {
          //     const scrollAmount = inputBottom - viewportHeight + 20;
          //     window.scrollBy(0, scrollAmount);
          //   }
          // }, 100);
        } else {
          // Keyboard closed, reset position
          chatInputContainer.css("bottom", "0px");
        }
      };

      window.addEventListener("resize", handleResize);

      chatInput.on("focus", function () {
        setTimeout(handleResize, 300);
      });

      chatInput.on("blur", function () {
        setTimeout(() => {
          chatInputContainer.css("bottom", "0px");
          initialViewportHeight = window.innerHeight;
        }, 100);
      });
    }
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
