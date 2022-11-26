try {
  const navLinks = document.querySelectorAll(".navlink");
  if (navLinks) {
    navLinks.forEach(link => {
      removeActive(link);
    });
  }
  const home = document.querySelector(".home");
  const uploadedFiles = document.querySelector(".uploadedFiles");
  const generatedArts = document.querySelector(".artGen");
  const working = document.querySelector(".working");
  if (window.location.href.match("/arts")) setActive(generatedArts);
  else if (window.location.href.match("/myUploads")) setActive(uploadedFiles);
  else setActive(home);

  function removeActive(link) {
    link.classList.remove("selectedlink");
  }
  function setActive(link) {
    link.classList.add("selectedlink");
  }

  console.log(window.location.href.match("/arts"));
} catch (err) {
  console.log(err);
}
