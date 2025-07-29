import WidgetKit
import SwiftUI
import SwiftData

struct Provider: TimelineProvider {
    @MainActor
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), goalTitle: "목표 불러오는 중...", isCompleted: false)
    }

    @MainActor
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = fetchFirstGoal()
        completion(entry)
    }

    @MainActor
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = fetchFirstGoal()
        // 15분마다 위젯을 새로고침하도록 설정
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    @MainActor
    private func fetchFirstGoal() -> SimpleEntry {
        do {
            let container = try appGroupContainer()
            let descriptor = FetchDescriptor<Goal>(sortBy: [SortDescriptor(\Goal.createdAt)])
            if let firstGoal = try container.mainContext.fetch(descriptor).first {
                return SimpleEntry(date: .now, goalTitle: firstGoal.title, isCompleted: firstGoal.isCompleted)
            } else {
                return SimpleEntry(date: .now, goalTitle: "오늘의 첫 목표!", isCompleted: false)
            }
        } catch {
            return SimpleEntry(date: .now, goalTitle: "목표를 불러올 수 없습니다", isCompleted: false)
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let goalTitle: String
    let isCompleted: Bool
}

struct YouthAiWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("오늘의 목표 🎯")
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                Image(systemName: entry.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(entry.isCompleted ? .green : .accentColor)
                Text(entry.goalTitle)
                    .font(.headline)
                    .strikethrough(entry.isCompleted)
            }
            
            Spacer()
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(red: 0.1, green: 0.1, blue: 0.15) // 위젯 배경색
        }
    }
}

@main
struct YouthAiWidget: Widget {
    let kind: String = "YouthAiWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            YouthAiWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("오늘의 목표")
        .description("가장 중요한 오늘의 목표를 확인하세요.")
        .supportedFamilies([.systemSmall])
    }
}

@MainActor
private func appGroupContainer() throws -> ModelContainer {
    let schema = Schema([Goal.self, Routine.self, JournalEntry.self, User.self, ChatMessage.self])
    let config = ModelConfiguration(
        schema: schema,
        groupContainer: .identifier("group.com.example.YouthAi")
    )
    return try ModelContainer(for: schema, configurations: [config])
}

struct YouthAiWidget_Previews: PreviewProvider {
    static var previews: some View {
        YouthAiWidgetEntryView(entry: SimpleEntry(date: Date(), goalTitle: "SwiftUI 공부하기", isCompleted: true))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
} 