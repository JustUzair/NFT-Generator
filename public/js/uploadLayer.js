const uploadLayer = async data => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/arts/uploadArt`,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `Layer Uploaded Successfully!!`);
      window.setTimeout(() => {
        location.assign("/myUploads");
      }, 2500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
document
  .querySelector(".form.form-upload-art")
  ?.addEventListener("submit", async e => {
    document.querySelector(".art__upload--btn").innerHTML = "Uploading...";
    e.preventDefault();
    const form = new FormData();
    form.append("art", document.getElementById("art").files[0]);

    await uploadLayer(form);
    document.querySelector(".art__upload--btn").innerHTML = "Upload Art";
  });
