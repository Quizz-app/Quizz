"use client";
import  { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";


export function MultiStepLoaderDemo({ loading }) {
  
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader  loading={loading} duration={2000} />

    </div>
  );
}
