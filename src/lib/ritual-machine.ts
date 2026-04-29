import { useReducer, useCallback } from "react";
import type { SignPoem } from "./signs";
import type { BeiResult } from "./jiaobei";

export type RitualState =
  | "ENTRANCE"
  | "TOMB_IDLE"
  | "WISHING"
  | "JIAO_PERMIT"
  | "SHAKING_SIGN"
  | "CONFIRM_SIGN"
  | "SHRINE_POEM"
  | "AI_ORACLE"
  | "TOMB_GRATITUDE"
  | "GRATITUDE_PALMS"
  | "POST_RITUAL"
  | "EXITING";

export interface RitualContext {
  state: RitualState;
  wish: string;
  drawnSign: SignPoem | null;
  shengCount: number; // 签号确认连圣筊计数
  lastBei: BeiResult | null;
  redeemed: boolean; // 已付费还愿
  incenseOffered: number; // 上香支数
  permitDenied: boolean; // 是否被阴筊拒绝
}

const initialContext: RitualContext = {
  state: "ENTRANCE",
  wish: "",
  drawnSign: null,
  shengCount: 0,
  lastBei: null,
  redeemed: false,
  incenseOffered: 0,
  permitDenied: false,
};

type Action =
  | { type: "ENTER_DONE" }
  | { type: "START_WISHING" }
  | { type: "SET_WISH"; wish: string }
  | { type: "WISH_CONFIRMED" }
  | { type: "PERMIT_RESULT"; bei: BeiResult }
  | { type: "START_REDEEM" }
  | { type: "REDEEM_DONE" }
  | { type: "SIGN_DRAWN"; sign: SignPoem }
  | { type: "CONFIRM_RESULT"; bei: BeiResult }
  | { type: "GIVE_UP_CONFIRM" }
  | { type: "OPEN_AI" }
  | { type: "CLOSE_AI" }
  | { type: "FINISH_POEM" }
  | { type: "PALMS_THANKS" }
  | { type: "INCENSE_THANKS"; sticks: number }
  | { type: "WISH_AGAIN" }
  | { type: "END_VISIT" }
  | { type: "EXIT_DONE" }
  | { type: "RESET" };

function reducer(ctx: RitualContext, action: Action): RitualContext {
  switch (action.type) {
    case "ENTER_DONE":
      return { ...ctx, state: "TOMB_IDLE" };

    case "START_WISHING":
      return { ...ctx, state: "WISHING", permitDenied: false };

    case "SET_WISH":
      return { ...ctx, wish: action.wish };

    case "WISH_CONFIRMED":
      return { ...ctx, state: "JIAO_PERMIT", lastBei: null };

    case "PERMIT_RESULT": {
      if (action.bei === "sheng") {
        return {
          ...ctx,
          state: "SHAKING_SIGN",
          lastBei: action.bei,
          shengCount: 0,
          drawnSign: null,
        };
      }
      if (action.bei === "xiao") {
        return { ...ctx, state: "WISHING", lastBei: action.bei };
      }
      // yin
      return { ...ctx, state: "EXITING", lastBei: action.bei, permitDenied: true };
    }

    case "START_REDEEM":
      return { ...ctx, state: "POST_RITUAL", redeemed: true };

    case "REDEEM_DONE":
      return { ...ctx, state: "POST_RITUAL", redeemed: true };

    case "SIGN_DRAWN":
      return { ...ctx, drawnSign: action.sign, state: "CONFIRM_SIGN", shengCount: 0 };

    case "CONFIRM_RESULT": {
      if (action.bei === "sheng") {
        const next = ctx.shengCount + 1;
        if (next >= 3) {
          return { ...ctx, state: "SHRINE_POEM", shengCount: next, lastBei: action.bei };
        }
        return { ...ctx, shengCount: next, lastBei: action.bei };
      }
      // 笑筊或阴筊：回到摇签
      return { ...ctx, state: "SHAKING_SIGN", shengCount: 0, lastBei: action.bei };
    }

    case "GIVE_UP_CONFIRM":
      return { ...ctx, state: "EXITING" };

    case "OPEN_AI":
      return { ...ctx, state: "AI_ORACLE" };

    case "CLOSE_AI":
      return { ...ctx, state: "SHRINE_POEM" };

    case "FINISH_POEM":
      return { ...ctx, state: "TOMB_GRATITUDE" };

    case "PALMS_THANKS":
      return { ...ctx, state: "GRATITUDE_PALMS" };

    case "INCENSE_THANKS":
      return {
        ...ctx,
        state: "GRATITUDE_PALMS",
        incenseOffered: ctx.incenseOffered + action.sticks,
      };

    case "WISH_AGAIN":
      return {
        ...ctx,
        state: "WISHING",
        wish: "",
        drawnSign: null,
        shengCount: 0,
        lastBei: null,
      };

    case "END_VISIT":
      return { ...ctx, state: "EXITING" };

    case "EXIT_DONE":
      return { ...initialContext };

    case "RESET":
      return initialContext;

    default:
      return ctx;
  }
}

export function useRitualMachine() {
  const [ctx, dispatch] = useReducer(reducer, initialContext);

  return {
    ctx,
    enterDone: useCallback(() => dispatch({ type: "ENTER_DONE" }), []),
    startWishing: useCallback(() => dispatch({ type: "START_WISHING" }), []),
    setWish: useCallback((wish: string) => dispatch({ type: "SET_WISH", wish }), []),
    wishConfirmed: useCallback(() => dispatch({ type: "WISH_CONFIRMED" }), []),
    permitResult: useCallback(
      (bei: BeiResult) => dispatch({ type: "PERMIT_RESULT", bei }),
      [],
    ),
    startRedeem: useCallback(() => dispatch({ type: "START_REDEEM" }), []),
    redeemDone: useCallback(() => dispatch({ type: "REDEEM_DONE" }), []),
    signDrawn: useCallback((sign: SignPoem) => dispatch({ type: "SIGN_DRAWN", sign }), []),
    confirmResult: useCallback(
      (bei: BeiResult) => dispatch({ type: "CONFIRM_RESULT", bei }),
      [],
    ),
    giveUpConfirm: useCallback(() => dispatch({ type: "GIVE_UP_CONFIRM" }), []),
    openAi: useCallback(() => dispatch({ type: "OPEN_AI" }), []),
    closeAi: useCallback(() => dispatch({ type: "CLOSE_AI" }), []),
    finishPoem: useCallback(() => dispatch({ type: "FINISH_POEM" }), []),
    palmsThanks: useCallback(() => dispatch({ type: "PALMS_THANKS" }), []),
    incenseThanks: useCallback(
      (sticks: number) => dispatch({ type: "INCENSE_THANKS", sticks }),
      [],
    ),
    wishAgain: useCallback(() => dispatch({ type: "WISH_AGAIN" }), []),
    endVisit: useCallback(() => dispatch({ type: "END_VISIT" }), []),
    exitDone: useCallback(() => dispatch({ type: "EXIT_DONE" }), []),
  };
}
