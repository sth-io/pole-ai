import React from "react";
import ListPersonas from "./list";
import { ManagePersona } from "./managePersona";

const Personas = () => {
  return (
    <>
      <ListPersonas />
      <ManagePersona />
    </>
  );
};

export default Personas;
