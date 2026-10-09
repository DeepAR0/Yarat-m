import UIKit
import Capacitor
import GameKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = GemblastBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}


class GemblastBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(GemblastGameCenterPlugin())
    }
}

@objc(GemblastGameCenterPlugin)
class GemblastGameCenterPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    let identifier = "GemblastGameCenterPlugin"
    let jsName = "GemblastGameCenter"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]
    private var authenticationCall: CAPPluginCall?

    @objc func authenticate(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.authenticationCall == nil else { call.reject("Authentication already running"); return }
            if GKLocalPlayer.local.isAuthenticated {
                call.resolve(["alias": GKLocalPlayer.local.alias]); return
            }
            self.authenticationCall = call
            GKLocalPlayer.local.authenticateHandler = { [weak self] controller, error in
                DispatchQueue.main.async {
                    guard let self = self, let pending = self.authenticationCall else { return }
                    if let controller = controller {
                        guard let root = self.bridge?.viewController, root.presentedViewController == nil else {
                            self.authenticationCall = nil; pending.reject("Game Center screen unavailable"); return
                        }
                        root.present(controller, animated: true)
                        return
                    }
                    self.authenticationCall = nil
                    if GKLocalPlayer.local.isAuthenticated {
                        pending.resolve(["alias": GKLocalPlayer.local.alias])
                    } else { pending.reject(error?.localizedDescription ?? "Game Center sign-in cancelled") }
                }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 120) { [weak self] in
                guard let self = self, self.authenticationCall === call else { return }
                self.authenticationCall = nil
                call.reject("Game Center sign-in timed out")
            }
        }
    }

    private func leaderboard(_ call: CAPPluginCall) -> String? {
        guard let id = call.getString("leaderboardId"),
              let ids = Bundle.main.object(forInfoDictionaryKey: "GemblastLeaderboardIDs") as? [String], ids.contains(id) else {
            call.reject("Leaderboard configuration missing"); return nil
        }
        return id
    }
    @objc func submit(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard GKLocalPlayer.local.isAuthenticated else { call.reject("Game Center sign-in required"); return }
            guard let id = self.leaderboard(call) else { return }
            guard let score = call.getInt("score"), score >= 0, score <= 10000000 else { call.reject("Invalid score"); return }
            GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [id]) { error in
                if let error = error { call.reject(error.localizedDescription) } else { call.resolve() }
            }
        }
    }
    @objc func open(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard GKLocalPlayer.local.isAuthenticated else { call.reject("Game Center sign-in required"); return }
            guard let id = self.leaderboard(call) else { return }
            guard let root = self.bridge?.viewController else { call.reject("Game Center screen unavailable"); return }
            guard root.presentedViewController == nil else { call.reject("Another screen is open"); return }
            let controller = GKGameCenterViewController(leaderboardID: id, playerScope: .global, timeScope: .allTime)
            controller.gameCenterDelegate = self
            root.present(controller, animated: true) { call.resolve() }
        }
    }
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
