const getArts = async id => {
  try {
    const res = await axios({
      method: "GET",
      url: `/artists/${id}/arts`,
    });
    console.log(res);
    if (res.status === 200) {
      location.assign(`/artists/${id}/arts`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    console.log(err.response.data.message);
  }
};

const getArtsBtns = document.querySelectorAll(".btn-artist-arts");
if (getArtsBtns)
  getArtsBtns.forEach(item => {
    item.addEventListener("click", e => {
      //   console.log(e.target.closest(".btn-artist-arts").dataset.id);
      getArts(e.target.closest(".btn-artist-arts").dataset.id);
    });
  });

const getArtsPFPs = document.querySelectorAll(".artist--pfp");
if (getArtsPFPs)
  getArtsPFPs.forEach(item => {
    item.addEventListener("click", e => {
      //   console.log(e.target.closest(".btn-artist-arts").dataset.id);
      getArts(document.querySelector(".btn-artist-arts").dataset.id);
    });
  });
