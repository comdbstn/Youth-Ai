import Foundation

enum ChatError: Error, LocalizedError {
    case invalidURL
    case noInternetConnection
    case badServerResponse
    case decodingError
    case unknownError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "오류: API 주소가 잘못되었습니다."
        case .noInternetConnection:
            return "오류: 인터넷에 연결되어 있지 않습니다. 네트워크 상태를 확인해주세요."
        case .badServerResponse:
            return "오류: 서버에서 응답이 없습니다. 잠시 후 다시 시도해주세요."
        case .decodingError:
            return "오류: 서버 응답을 처리하는 데 실패했습니다."
        case .unknownError(let error):
            return "알 수 없는 오류가 발생했습니다: \\(error.localizedDescription)"
        }
    }
}

class ChatService {
    private let apiKey: String
    private let apiURL = URL(string: "https://api.openai.com/v1/chat/completions")!

    init() {
        self.apiKey = Self.loadApiKey()
    }

    private static func loadApiKey() -> String {
        guard let path = Bundle.main.path(forResource: "ApiKeys", ofType: "plist"),
              let dict = NSDictionary(contentsOfFile: path),
              let key = dict["OPENAI_API_KEY"] as? String else {
            fatalError("API Key not found. Please check your ApiKeys.plist file.")
        }
        return key
    }

    func sendMessage(messages: [OpenAIRequest.Message], userPersonality: String?) async throws -> String {
        var request = URLRequest(url: apiURL)
        request.httpMethod = "POST"
        request.addValue("Bearer \\(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let systemMessage = OpenAIRequest.Message(
            role: "system",
            content: "You are Yof, a friendly and supportive AI life coach. Your user's personality is: \\(userPersonality ?? "not set"). Tailor your responses to be encouraging and empathetic based on their personality."
        )
        let requestMessages = [systemMessage] + messages
        
        let requestBody = OpenAIRequest(model: "gpt-3.5-turbo", messages: requestMessages)
        request.httpBody = try JSONEncoder().encode(requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw ChatError.badServerResponse
        }

        do {
            let apiResponse = try JSONDecoder().decode(OpenAIResponse.self, from: data)
            return apiResponse.choices.first?.message.content ?? "죄송합니다. 답변을 생성할 수 없습니다."
        } catch {
            throw ChatError.decodingError
        }
    }
} 