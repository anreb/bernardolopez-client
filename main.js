$(document).ready(function () {
  // Navigation functionality
  $(".nav-button").on("click", function () {
    const targetSection = $(this).data("section");

    // Update active nav button
    $(".nav-button").removeClass("active");
    $(this).addClass("active");

    // Show target section, hide others
    $(".content-section").removeClass("active");
    $("#" + targetSection).addClass("active");
  });

  // Chat functionality
  const chatMessages = $("#chatMessages");
  const chatInput = $("#chatInput");
  const sendButton = $("#sendButton");

  function addMessage(content, isUser) {
    const messageClass = isUser
      ? "message user-message"
      : "message bot-message";
    const messageDiv = $("<div>").addClass(messageClass);
    const messageContent = $("<p>").text(content);
    messageDiv.append(messageContent);
    chatMessages.append(messageDiv);
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
  }

  function sendMessage() {
    const question = chatInput.val().trim();
    if (!question) return;

    // Add user message
    addMessage(question, true);
    chatInput.val("");

    // Disable input while processing
    chatInput.prop("disabled", true);
    sendButton.prop("disabled", true);

    // Show loading message
    const loadingMessage = $("<div>").addClass("message bot-message loading");
    loadingMessage.append($("<p>").text("Thinking..."));
    chatMessages.append(loadingMessage);
    chatMessages.scrollTop(chatMessages[0].scrollHeight);

    // Send request to backend
    $.ajax({
      url: "https://api.bernardolopez.me/api/chat", // Update this with your actual endpoint
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ question: question }),
      success: function (response) {
        // Remove loading message
        loadingMessage.remove();

        // Add bot response
        const answer =
          response.answer || response.message || "I received your question!";
        addMessage(answer, false);
      },
      error: function (xhr, status, error) {
        // Remove loading message
        loadingMessage.remove();

        // Handle error
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
        // Re-enable input
        chatInput.prop("disabled", false);
        sendButton.prop("disabled", false);
        chatInput.focus();
      },
    });
  }

  // Send message on button click
  sendButton.on("click", sendMessage);

  // Send message on Enter key
  chatInput.on("keypress", function (e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
