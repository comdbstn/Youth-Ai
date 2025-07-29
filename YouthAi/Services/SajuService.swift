import Foundation

struct Fortune {
    let summary: String
    let positiveAspect: String
    let negativeAspect: String
    let personality: String
}

class SajuService {
    func getFortune(for birthDate: Date) -> Fortune {
        let calendar = Calendar.current
        let month = calendar.component(.month, from: birthDate)
        
        // 월별로 간단한 성향 및 운세 매칭 (더미 데이터)
        switch month {
        case 1...3:
            return Fortune(
                summary: "봄의 기운처럼 새로운 시작에 좋은 에너지가 가득합니다.",
                positiveAspect: "창의력과 도전 정신이 빛을 발하는 하루입니다.",
                negativeAspect: "성급한 결정은 피하는 것이 좋습니다.",
                personality: "당신은 새로운 도전을 두려워하지 않는 진취적인 성향을 가졌습니다."
            )
        case 4...6:
            return Fortune(
                summary: "여름의 열정처럼 활기찬 하루가 예상됩니다.",
                positiveAspect: "대인관계에서 좋은 소식이 있을 수 있습니다.",
                negativeAspect: "감정적인 소비를 주의해야 합니다.",
                personality: "당신은 주변 사람들에게 긍정적인 에너지를 주는 사교적인 성향입니다."
            )
        case 7...9:
            return Fortune(
                summary: "가을의 풍요로움처럼 노력의 결실을 맺을 수 있는 날입니다.",
                positiveAspect: "집중력이 높아져 학업이나 업무 성과가 좋습니다.",
                negativeAspect: "작은 오해로 관계가 틀어지지 않도록 주의하세요.",
                personality: "당신은 신중하고 깊이 생각하며, 맡은 바를 끝까지 해내는 책임감 있는 성향입니다."
            )
        default:
            return Fortune(
                summary: "겨울의 고요함처럼 차분하게 자신을 돌아보는 시간이 필요합니다.",
                positiveAspect: "내면의 성찰을 통해 중요한 깨달음을 얻을 수 있습니다.",
                negativeAspect: "건강 관리에 조금 더 신경 쓰는 것이 좋습니다.",
                personality: "당신은 통찰력이 뛰어나고, 자신만의 신념이 뚜렷한 독립적인 성향을 가졌습니다."
            )
        }
    }
} 