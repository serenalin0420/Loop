const customStyles = (view) => ({
  control: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    padding: "2px 0",
    borderRadius: "4px",
    borderColor: state.isFocused
      ? view === "student"
        ? "#8cd0ed"
        : "#ffbd71"
      : provided.borderColor,
    boxShadow: state.isFocused
      ? `0 0 0 1px ${view === "student" ? "#8cd0ed" : "#ffbd71"}`
      : provided.boxShadow,
    overflow: "hidden",
    "&:hover": {
      borderColor: state.isFocused
        ? view === "student"
          ? "#8cd0ed"
          : "#ffbd71"
        : provided.borderColor,
    },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    backgroundColor: state.isSelected
      ? view === "student"
        ? "#c2e4f5"
        : "#ffd9a8"
      : state.isFocused
        ? view === "student"
          ? "#e4f1fa"
          : "#ffeed4"
        : provided.borderColor,
    color: state.isSelected ? "#262626" : "#525252",
    ":active": {
      backgroundColor: view === "student" ? "#c2e4f5" : "#ffd9a8",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    fontSize: "16px",
    backgroundColor: view === "student" ? "#c2e4f5" : "#ffd9a8",
    borderRadius: "4px",
    marginRight: "6px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: "16px",
    paddingLeft: "8px",
    paddingRight: "0",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    fontSize: "16px",
    borderRadius: "4px",
    ":hover": { backgroundColor: view === "student" ? "#8cd0ed" : "#ffbd71" },
  }),
});

export default customStyles;
