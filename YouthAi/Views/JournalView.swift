import SwiftUI
import SwiftData
import Charts

struct JournalView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: .date, order: .reverse) private var entries: [JournalEntry]
    
    @State private var showingNewEntrySheet = false
    @State private var showingReportSheet = false
    @State private var reportText: String?

    var body: some View {
        NavigationView {
            List {
                ForEach(entries) { entry in
                    VStack(alignment: .leading) {
                        Text("\(entry.date, formatter: itemFormatter)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("감정: \(entry.emotion)")
                            .fontWeight(.bold)
                        Text(entry.entryText)
                            .lineLimit(2)
                    }
                    .listRowBackground(Color.theme.componentBackground)
                }
                .onDelete(perform: deleteItems)
            }
            .background(Color.theme.background)
            .scrollContentBackground(.hidden)
            .navigationTitle("나의 일지 📖")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showingReportSheet = true }) {
                        Label("리포트 보기", systemImage: "chart.bar.doc.horizontal")
                    }
                    .disabled(entries.isEmpty)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: { showingNewEntrySheet = true }) {
                        Label("Add Item", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingNewEntrySheet) {
                NewJournalEntryView()
            }
            .sheet(isPresented: $showingReportSheet) {
                JournalReportView(entries: entries, reportText: $reportText)
            }
        }
    }

    private func deleteItems(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(entries[index])
            }
        }
    }
}

struct JournalReportView: View {
    @Environment(\.dismiss) private var dismiss
    let entries: [JournalEntry]
    @Binding var reportText: String?
    
    @State private var isLoading = false
    private let chatService = ChatService()
    
    // 최근 7일간의 기록만 필터링
    private var recentEntries: [JournalEntry] {
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: .now)!
        return entries.filter { $0.date >= sevenDaysAgo }
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // 감정 변화 차트
                if !recentEntries.isEmpty {
                    Chart {
                        ForEach(recentEntries) { entry in
                            LineMark(
                                x: .value("날짜", entry.date, unit: .day),
                                y: .value("감정 점수", emotionScore(for: entry.emotion))
                            )
                            .symbol(by: .value("감정", entry.emotion))
                        }
                    }
                    .chartYScale(domain: 0...6)
                    .frame(height: 200)
                    .padding()
                    .background(Color.theme.componentBackground)
                    .cornerRadius(10)
                    .padding(.horizontal)
                }

                if isLoading {
                    ProgressView("리포트를 생성 중입니다...")
                } else if let reportText = reportText {
                    ScrollView {
                        Text(reportText)
                            .padding()
                    }
                } else {
                    ContentUnavailableView("리포트 생성 실패", systemImage: "exclamationmark.triangle", description: Text("리포트를 생성하는 데 문제가 발생했습니다."))
                }
            }
            .navigationTitle("감정 리포트")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("닫기") { dismiss() }
                }
            }
            .onAppear(perform: generateReport)
        }
    }
    
    private func emotionScore(for emotion: String) -> Int {
        switch emotion {
        case "🙂 행복": return 5
        case "😊 기쁨": return 4
        case "😐 보통": return 3
        case "😢 슬픔": return 2
        case "😠 화남": return 1
        default: return 0
        }
    }
    
    private func generateReport() {
        guard reportText == nil else { return } // 이미 생성된 경우 다시 생성하지 않음
        
        isLoading = true
        
        Task {
            let history = entries.map { "날짜: \($0.date), 감정: \($0.emotion), 내용: \($0.entryText)" }.joined(separator: "\n---\n")
            let prompt = "다음은 사용자의 감정 기록입니다. 이 기록들을 바탕으로 사용자의 감정 패턴, 주요 감정, 그리고 긍정적인 조언을 포함한 종합적인 리포트를 작성해주세요.\n\n[기록]\n\n\(history)"
            
            let requestMessage = OpenAIRequest.Message(role: "user", content: prompt)
            
            do {
                let response = try await chatService.sendMessage(messages: [requestMessage], userPersonality: nil)
                self.reportText = response
            } catch {
                self.reportText = "리포트 생성 중 오류가 발생했습니다: \(error.localizedDescription)"
            }
            isLoading = false
        }
    }
}

private let itemFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .long
    formatter.timeStyle = .medium
    return formatter
}()

struct NewJournalEntryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var emotion: String = "🙂 행복"
    @State private var entryText: String = ""
    private let emotions = ["🙂 행복", "😊 기쁨", "😐 보통", "😢 슬픔", "😠 화남"]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                Form {
                    Section(header: Text("오늘의 감정")) {
                        Picker("감정 선택", selection: $emotion) {
                            ForEach(emotions, id: \.self) {
                                Text($0)
                            }
                        }
                        .pickerStyle(.inline)
                        .labelsHidden()
                        .listRowBackground(Color.theme.componentBackground)
                    }
                    
                    Section(header: Text("오늘의 기록")) {
                        TextEditor(text: $entryText)
                            .frame(height: 200)
                            .listRowBackground(Color.theme.componentBackground)
                    }
                }
                .scrollContentBackground(.hidden)
                .navigationTitle("새로운 기록")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("취소") {
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("저장") {
                            addItem()
                            dismiss()
                        }
                        .disabled(entryText.isEmpty)
                    }
                }
            }
        }
    }
    
    private func addItem() {
        let newEntry = JournalEntry(emotion: emotion, entryText: entryText)
        modelContext.insert(newEntry)
    }
}

struct JournalView_Previews: PreviewProvider {
    static var previews: some View {
        let config = ModelConfiguration(inMemory: true)
        let container = try! ModelContainer(for: JournalEntry.self, User.self, configurations: config)
        // Add sample entries for preview
        container.mainContext.insert(JournalEntry(emotion: "🙂 행복", entryText: "오늘은 코딩이 잘 돼서 행복했다."))
        container.mainContext.insert(JournalEntry(emotion: "😢 슬픔", entryText: "버그를 잡지 못해 슬펐다."))

        return JournalView()
            .modelContainer(container)
    }
} 