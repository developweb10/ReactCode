const mimeTypesByExtension: { [extension: string]: string } = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  txt: "text/plain",
  webp: "image/webp",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};

const getFileNameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return "";

  const encodedFileNameMatch = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i
  );
  if (encodedFileNameMatch?.[1]) {
    return decodeURIComponent(encodedFileNameMatch[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1] || "";
};

const getMimeTypeFromFileName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? mimeTypesByExtension[extension] : undefined;
};

export function downloadBlob(response: any, type?: string, fallbackName?: string) {
  // Create an object URL for the blob object
  const contentDisposition = response.headers["content-disposition"];
  const fileName =
    getFileNameFromContentDisposition(contentDisposition) ||
    fallbackName ||
    "download";
  const resolvedType =
    type ||
    response.data?.type ||
    getMimeTypeFromFileName(fileName) ||
    "application/octet-stream";
  const blob = new Blob([response.data], { type: resolvedType });
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const a = document.createElement("a");

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = fileName;

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = function (this: any) {
    setTimeout(() => {
      // Release the object URL
      URL.revokeObjectURL(url);

      // Remove the event listener from the anchor element
      this.removeEventListener("click", clickHandler);

      // Remove the anchor element from the DOM
      (this.remove && (this.remove(), 1)) ||
        (this.parentNode && this.parentNode.removeChild(this));
    }, 150);
  };

  // Add the click event listener on the anchor element
  a.addEventListener("click", clickHandler, false);

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  a.click();

  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a;
}
