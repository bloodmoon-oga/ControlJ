"use client";
import { useEffect } from "react";

//Somente um redirecionamento para a Tela de login
export default function Home() {
  useEffect(() => {
    window.location.href = window.location.href + "/login";
  }, []);
  return <></>;
}
