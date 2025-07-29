import SwiftUI
import SwiftData

// 메인 앱의 데이터 모델을 가져와야 합니다.
// Xcode 프로젝트 설정에서 YouthAiWatch 타겟의 'Build Phases' -> 'Compile Sources'에
// Routine.swift, User.swift 등 필요한 모델 파일들을 추가해주세요.

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \.name) private var routines: [Routine]

    var body: some View {
        NavigationStack {
            List {
                if routines.isEmpty {
                    Text("메인 앱에서 루틴을 추가해주세요.")
                } else {
                    ForEach(routines) { routine in
                        Button(action: {
                            routine.count += 1
                        }) {
                            HStack {
                                Text(routine.name)
                                Spacer()
                                Text("\(routine.count) 회")
                                    .foregroundColor(.accentColor)
                            }
                        }
                    }
                }
            }
            .navigationTitle("나의 루틴 💪")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
} 