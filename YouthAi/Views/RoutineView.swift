import SwiftUI
import SwiftData
import Charts

struct RoutineView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \.name) private var routines: [Routine]
    
    @State private var showingAddSheet = false

    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                VStack {
                    if routines.isEmpty {
                        ContentUnavailableView("루틴이 없습니다.", systemImage: "list.bullet.clipboard", description: Text("새로운 루틴을 추가하여 습관을 만들어보세요."))
                    } else {
                        Chart(routines) { routine in
                            BarMark(
                                x: .value("루틴", routine.name),
                                y: .value("횟수", routine.count)
                            )
                            .foregroundStyle(Color.theme.accent)
                        }
                        .padding()
                        .background(Color.theme.componentBackground)
                        .cornerRadius(10)
                    }

                    List {
                        ForEach(routines) { routine in
                            RoutineRowView(routine: routine)
                                .listRowBackground(Color.theme.componentBackground)
                        }
                        .onDelete(perform: deleteRoutines)
                    }
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("나의 루틴 💪")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: { showingAddSheet = true }) {
                        Label("루틴 추가", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddRoutineSheet()
            }
        }
    }

    private func deleteRoutines(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(routines[index])
            }
        }
    }
}

struct RoutineRowView: View {
    @Bindable var routine: Routine
    
    var body: some View {
        HStack {
            Text(routine.name)
            Spacer()
            Text("\(routine.count) 회")
            Button {
                routine.count += 1
                routine.lastUpdated = .now
            } label: {
                Image(systemName: "plus.circle.fill")
            }
            .buttonStyle(.plain)
        }
    }
}

struct AddRoutineSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String = ""
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                Form {
                    TextField("루틴 이름 (예: 금연)", text: $name)
                        .listRowBackground(Color.theme.componentBackground)
                }
                .scrollContentBackground(.hidden)
                .navigationTitle("새로운 루틴 추가")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("취소") { dismiss() }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button("저장") {
                            addRoutine()
                            dismiss()
                        }
                        .disabled(name.isEmpty)
                    }
                }
            }
        }
    }
    
    private func addRoutine() {
        let newRoutine = Routine(name: name)
        modelContext.insert(newRoutine)
    }
}

struct RoutineView_Previews: PreviewProvider {
    static var previews: some View {
        RoutineView()
            .modelContainer(for: Routine.self, inMemory: true)
    }
} 