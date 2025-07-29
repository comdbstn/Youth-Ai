import SwiftUI
import SwiftData

struct ChatbotView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \.timestamp) private var messages: [ChatMessage]
    
    @Query private var users: [User]
    private var user: User? { users.first }
    private let sajuService = SajuService()
    
    @State private var userInput: String = ""
    @State private var isSending: Bool = false
    private let chatService = ChatService()

    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                
                VStack {
                    // 메시지 목록
                    ScrollView {
                        ScrollViewReader { proxy in
                            VStack(spacing: 12) {
                                ForEach(messages) { message in
                                    MessageView(message: message)
                                        .id(message.id)
                                }
                            }
                            .padding()
                            .onChange(of: messages.count) { _ in
                                // 새 메시지가 추가되면 맨 아래로 스크롤
                                if let lastMessage = messages.last {
                                    proxy.scrollTo(lastMessage.id, anchor: .bottom)
                                }
                            }
                        }
                    }

                    // 메시지 입력부
                    HStack {
                        TextField("Yof에게 메시지 보내기...", text: $userInput, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(1...5)

                        if isSending {
                            ProgressView()
                                .padding(.horizontal, 10)
                        } else {
                            Button(action: {
                                Task {
                                    await sendMessage()
                                }
                            }) {
                                Image(systemName: "paperplane.fill")
                            }
                            .font(.title2)
                            .disabled(userInput.isEmpty)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Yof")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func sendMessage() async {
        isSending = true
        let userMessage = ChatMessage(text: userInput, isFromUser: true, timestamp: .now)
        modelContext.insert(userMessage)
        
        let messageText = userInput
        userInput = ""

        do {
            let personality = user.map { sajuService.getFortune(for: $0.birthDate).personality }
            let history = messages.map { OpenAIRequest.Message(role: $0.isFromUser ? "user" : "assistant", content: $0.text) }
            let botResponseText = try await chatService.sendMessage(messages: history, userPersonality: personality)
            let botMessage = ChatMessage(text: botResponseText, isFromUser: false, timestamp: .now)
            modelContext.insert(botMessage)
        } catch {
            let errorMessage = ChatMessage(text: "오류가 발생했습니다: \\(error.localizedDescription)", isFromUser: false, timestamp: .now)
            modelContext.insert(errorMessage)
        }
        
        isSending = false
    }
}

// 메시지 셀 뷰
struct MessageView: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.isFromUser {
                Spacer()
                Text(message.text)
                    .padding(12)
                    .background(Color.theme.accent)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            } else {
                Text(message.text)
                    .padding(12)
                    .background(Color.theme.componentBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                Spacer()
            }
        }
    }
}


struct ChatbotView_Previews: PreviewProvider {
    static var previews: some View {
        let config = ModelConfiguration(inMemory: true)
        let container = try! ModelContainer(for: ChatMessage.self, User.self, configurations: config)
        container.mainContext.insert(ChatMessage(text: "미리보기 메시지입니다.", isFromUser: false))
        
        return ChatbotView()
            .modelContainer(container)
    }
} 