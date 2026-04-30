import { Component, type ReactNode } from "react";
import { RitualButton } from "./RitualButton";

interface Props {
  onBack: () => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 解签聊天错误边界：避免任何渲染/异步错误冒泡导致整页闪退。
 * 出错时给出温和的提示与"返回签文"按钮。
 */
export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("AiOracleChat error boundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-ink/95 px-6 text-center backdrop-blur-xl animate-fade-in">
          <div className="font-display text-xl tracking-[0.4em] text-gold">
            山中起霧
          </div>
          <div className="max-w-xs text-xs leading-relaxed tracking-widest text-muted-foreground">
            庙祝一時失神，與信眾的問答中斷了。
            <br />
            可返回籤文，稍後再來請示。
          </div>
          <RitualButton
            onClick={() => {
              this.setState({ error: null });
              this.props.onBack();
            }}
          >
            返回籤文
          </RitualButton>
        </div>
      );
    }
    return this.props.children;
  }
}
