import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var goals: [Goal]
    @Query private var users: [User]
    
    private var user: User? { users.first }
    private let sajuService = SajuService()
    
    @State private var fortune: Fortune?
    @State private var showingBriefingAlert = false
    @State private var briefingText: String?
    @State private var isGeneratingBriefing = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // 오늘의 운세 섹션
                        VStack(alignment: .leading) {
                            Text("오늘의 운세 🍀")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            if let fortune = fortune {
                                Text(fortune.summary)
                                    .padding()
                                    .background(Color.theme.componentBackground)
                                    .cornerRadius(10)
                            } else {
                                Text("사용자 정보를 설정에서 입력해주세요.")
                                    .padding()
                                    .background(Color.theme.componentBackground)
                                    .cornerRadius(10)
                            }
                        }
                        
                        Divider()

                        // 기상/취침 체크 섹션
                        VStack(alignment: .leading) {
                            Text("수면 관리 🌙")
                                .font(.title2)
                                .fontWeight(.bold)
                            HStack(spacing: 20) {
                                Button("기상 시간 기록") {
                                    // 기상 시간 기록 액션
                                }
                                .buttonStyle(.borderedProminent)
                                
                                Button("취침 시간 기록") {
                                    // 취침 시간 기록 액션
                                }
                                .buttonStyle(.bordered)
                            }
                        }
                        
                        Divider()

                        // 오늘의 목표 섹션
                        VStack(alignment: .leading) {
                            HStack {
                                Text("오늘의 목표 🎯")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                Spacer()
                                
                                if isGeneratingBriefing {
                                    ProgressView()
                                } else {
                                    Button(action: generateBriefing) {
                                        Image(systemName: "sparkles")
                                    }
                                    .disabled(goals.isEmpty)
                                }

                                Button(action: addGoal) {
                                    Image(systemName: "plus")
                                }
                            }
                            
                            // 목표 리스트
                            ForEach(goals) { goal in
                                Toggle(isOn: binding(for: goal)) {
                                    Text(goal.title)
                                }
                            }
                        }
                    }
                    .padding()
                }
                .navigationTitle(user != nil ? "안녕하세요, \(user!.name)님!" : "안녕하세요!")
                .onAppear(perform: loadFortune)
                .alert("오늘의 브리핑", isPresented: $showingBriefingAlert, presenting: briefingText) { _ in
                    Button("확인") {}
                } message: { text in
                    Text(text)
                }
            }
        }
    }

    private func addGoal() {
        let newGoal = Goal(title: "새로운 목표")
        modelContext.insert(newGoal)
    }
    
    private func binding(for goal: Goal) -> Binding<Bool> {
        Binding(
            get: { goal.isCompleted },
            set: { newValue in
                goal.isCompleted = newValue
            }
        )
    }
    
    private func loadFortune() {
        if let user = user {
            fortune = sajuService.getFortune(for: user.birthDate)
        }
    }
    
    private func generateBriefing() {
        isGeneratingBriefing = true
        Task {
            let goalList = goals.map { "- \(0.title) (완료: \(0.isCompleted ? "예" : "아니오"))" }.joined(separator: "\n")
            let prompt = "다음은 오늘의 목표 리스트입니다. 이 내용을 바탕으로 오늘 하루의 일정을 친근하고 격려하는 톤으로 요약 브리핑해주세요.\n\n[목표 리스트]\n\(goalList)"
            
            let requestMessage = OpenAIRequest.Message(role: "user", content: prompt)
            
            do {
                let response = try await ChatService().sendMessage(messages: [requestMessage], userPersonality: nil)
                self.briefingText = response
                self.showingBriefingAlert = true
            } catch {
                self.briefingText = "브리핑 생성 중 오류가 발생했습니다."
                self.showingBriefingAlert = true
            }
            isGeneratingBriefing = false
        }
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        let config = ModelConfiguration(inMemory: true)
        let container = try! ModelContainer(for: Goal.self, User.self, configurations: config)
        let sampleUser = User(name: "정윤수", birthDate: .now)
        container.mainContext.insert(sampleUser)
        container.mainContext.insert(Goal(title: "아침 운동"))
        
        return HomeView()
            .modelContainer(container)
    }
} 