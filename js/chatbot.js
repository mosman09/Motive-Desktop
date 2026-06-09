// Chatbot Functionality
class Chatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.attachEventListeners();
    this.loadInitialGreeting();
  }

  createChatbotUI() {
    const chatbotHTML = `
      <div class="chatbot-container" id="chatbot">
        <div class="chatbot-header">
          <h3>Motive Assistant</h3>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-area">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Ask me anything..." 
            class="chatbot-input"
          />
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      </div>
      <button class="chatbot-toggle" id="chatbot-toggle">
        <ion-icon name="chatbubbles"></ion-icon>
      </button>
    `;

    document.body.insertAdjacentHTML("beforeend", chatbotHTML);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const closeBtn = document.getElementById("chatbot-close");
    const sendBtn = document.getElementById("chatbot-send");
    const input = document.getElementById("chatbot-input");

    toggleBtn.addEventListener("click", () => this.toggleChat());
    closeBtn.addEventListener("click", () => this.closeChat());
    sendBtn.addEventListener("click", () => this.sendMessage());
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
  }

  toggleChat() {
    const chatbot = document.getElementById("chatbot");
    this.isOpen ? this.closeChat() : this.openChat();
  }

  openChat() {
    const chatbot = document.getElementById("chatbot");
    chatbot.classList.add("active");
    this.isOpen = true;
    document.getElementById("chatbot-input").focus();
  }

  closeChat() {
    const chatbot = document.getElementById("chatbot");
    chatbot.classList.remove("active");
    this.isOpen = false;
  }

  loadInitialGreeting() {
    this.addMessage(
      "bot",
      "Hi there! 👋 I'm the Motive Assistant. How can I help you today?"
    );
  }

  sendMessage() {
    const input = document.getElementById("chatbot-input");
    const message = input.value.trim();

    if (!message) return;

    this.addMessage("user", message);
    input.value = "";

    // Simulate bot response
    setTimeout(() => {
      const response = this.generateResponse(message);
      this.addMessage("bot", response);
    }, 500);
  }

  addMessage(sender, text) {
    const messagesContainer = document.getElementById("chatbot-messages");
    const messageEl = document.createElement("div");
    messageEl.classList.add("chatbot-message", `chatbot-message-${sender}`);
    messageEl.innerHTML = `<p>${text}</p>`;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({ sender, text });
  }

  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();

    const responses = {
      design: "We offer cutting-edge AI-powered design solutions! Check out our Design section to see how we can help.",
      pricing: "We have two plans: Starter at £399 and Complete at £649. The Complete plan includes more daily designs and unlimited design styles.",
      services:
        "Our services include Branding, Web Development, Desktop Applications, DevOps Automation, AWS Services, Database Management, AI Integration, and Markdown Documentation.",
      "how it works":
        "It's simple! Tell us what you like, our AI tool creates personalized designs, and you can enjoy your new designs right away.",
      ai: "Our AI technology creates 100% personalized designs based on your preferences and needs. It's like having a professional designer on your team 24/7!",
      free:
        "Yes! We offer a free sample design for you to try. No credit card required to get started.",
      contact:
        "You can reach us at hello@motivedesign.com or call 415-201-6370. We're here to help!",
      team: "Motive Design is an AI-powered design team dedicated to making quality design accessible to everyone.",
      hello: "Hello! 👋 How can I assist you today?",
      hi: "Hey there! What would you like to know about Motive Design?",
    };

    // Check for keyword matches
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response;
      }
    }

    // Default response
    return "That's a great question! Could you tell me more about what you'd like to know? You can ask me about pricing, services, design, or how we work!";
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new Chatbot();
});
