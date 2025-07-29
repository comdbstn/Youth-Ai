import SwiftUI

struct DigitalDetoxView: View {
    @State private var usageLimitHours = 1.0
    @State private var timerMinutes = 15.0
    @State private var isTimerRunning = false
    @State private var timeRemaining: TimeInterval = 15 * 60

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                Form {
                    Section(header: Text("SNS 사용 제한 설정")) {
                        VStack(alignment: .leading) {
                            Text("오늘의 목표 사용 시간: \(Int(usageLimitHours))시간")
                            Slider(value: $usageLimitHours, in: 0...5, step: 1)
                        }
                        .listRowBackground(Color.theme.componentBackground)
                    }
                    
                    Section(header: Text("집중과 휴식 타이머")) {
                        VStack {
                            if isTimerRunning {
                                Text(timeString(time: timeRemaining))
                                    .font(.system(size: 60, weight: .bold, design: .monospaced))
                                    .padding()
                                
                                Button("타이머 중지") {
                                    stopTimer()
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(.red)
                            } else {
                                Text("타이머 설정 (분)")
                                Slider(value: $timerMinutes, in: 5...60, step: 5)
                                Text("\(Int(timerMinutes)) 분")
                                
                                Button("타이머 시작") {
                                    startTimer()
                                }
                                .buttonStyle(.borderedProminent)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .listRowBackground(Color.theme.componentBackground)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("디지털 디톡스 🧘")
            .onReceive(timer) { _ in
                guard isTimerRunning else { return }
                if timeRemaining > 0 {
                    timeRemaining -= 1
                } else {
                    stopTimer()
                    // 타이머 종료 알림 (실제 앱에서는 푸시 알림 등 사용)
                    print("타이머가 종료되었습니다!")
                }
            }
        }
    }
    
    private func startTimer() {
        timeRemaining = timerMinutes * 60
        isTimerRunning = true
    }
    
    private func stopTimer() {
        isTimerRunning = false
    }
    
    private func timeString(time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%02i:%02i", minutes, seconds)
    }
}

struct DigitalDetoxView_Previews: PreviewProvider {
    static var previews: some View {
        DigitalDetoxView()
    }
} 