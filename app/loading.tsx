import React from "react";
import { Spinner } from "@heroui/spinner";

const loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
    </div>
  );
};

export default loading;
