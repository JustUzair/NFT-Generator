const generateNFTs = async () => {
  const artistID = document
    .querySelector(".art__generate--btn")
    ?.closest(".form__group.right").dataset.id;
  //   console.log(artistID);

  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/arts/generateArts`,
    });
    if (res.data.status === "success") {
      showAlert("success", `Your NFTs have been generated successfully!!`);
      window.setTimeout(() => {
        location.assign(`/artists/${artistID}/arts`);
      }, 3000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    console.log("error", err);
  }
};

document
  .querySelector(".form.form-generate-art")
  ?.addEventListener("submit", async e => {
    document.querySelector(".art__generate--btn").innerHTML =
      "Generating NFTs...";

    e.preventDefault();
    await generateNFTs();

    document.querySelector(".art__generate--btn").innerHTML = "Generate Arts";
  });
