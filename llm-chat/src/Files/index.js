import React, { useState } from "react";
import { Collections } from "./Collections";
import { Divider } from "@mui/material";
import { FileIndex } from "./FileIndex";
import { ModelPicker } from "../ModelPicker";
import { useChatStore } from "../Chat/chatContext";
import { ButtonSth } from "../LayoutComponents/Button";

const ListFiles = ({ trigger }) => {
  const [indexModal, setIndexModal] = useState(false);
  const { collection, setCollection, ragOptions, ragOptionsSetter } =
    useChatStore(
      ({ collection, setCollection, ragOptions, ragOptionsSetter }) => ({
        collection,
        setCollection,
        ragOptions,
        ragOptionsSetter,
      })
    );

  return (
    <div>
      <Divider variant="middle" sx={{ padding: "10px 0" }}>
        choose embedding model
      </Divider>
      <ModelPicker
        label="embedding model"
        trigger={trigger}
        model={ragOptions.model}
        setModel={(value) => ragOptionsSetter("model", value)}
      />
      <Divider variant="middle" sx={{ padding: "10px 0" }}>
        choose collection
      </Divider>
      <Collections
        collection={collection}
        setCollection={setCollection}
        trigger={trigger}
      />
      <Divider variant="middle" sx={{ padding: "10px 0" }}>
        add to collection
      </Divider>
      <ButtonSth fullWidth onClick={() => setIndexModal(true)}>
        Add Files
      </ButtonSth>
      <FileIndex
        handleClose={() => setIndexModal(false)}
        open={indexModal}
        model={ragOptions.model}
      />
    </div>
  );
};

export default ListFiles;
