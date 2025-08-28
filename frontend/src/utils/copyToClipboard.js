import { toast } from "react-toastify";

export const copyToClipboard = (text) => {
    console.log("copyToClipboard called", text);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text) => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = 0;
    textarea.style.left = 0;
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (successful) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy.");
    }
  } catch (err) {
    toast.error("Clipboard not supported.");
  }
};
