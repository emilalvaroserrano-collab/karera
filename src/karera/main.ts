import "./style.css";
import { Game } from "./game/engine";
import { Auth } from "./game/auth";
import { LoadingScreen } from "./game/screens/loading";

let current: Game | null = null;

/** Start the canvas game once the #game element is in the document. */
export function startGame(): void {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("#game canvas missing");
  if (current && current.canvas === canvas && current.canvas.isConnected) return;
  current?.stop();
  const game = new Game(canvas);
  current = game;
  void Auth.init().then(() => {
    if (current !== game) return;
    game.show(new LoadingScreen(game));
  });
  game.run();
  (window as unknown as { __game: Game }).__game = game;
}
