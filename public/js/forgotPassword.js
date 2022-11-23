const forgotPassword = async email => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/forgotPassword`,
      data: {
        email,
      },
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        "An email with password reset link has been sent to your registered email!"
      );
      window.setTimeout(() => {
        location.assign("/login");
      }, 5000);
    }
    // console.log(res);
  } catch (err) {
    showAlert("error", err.response.data.message);

    console.log(err);
  }
};

document
  .querySelector(".form--forgot-password")
  ?.addEventListener("submit", async e => {
    e.preventDefault();
    document.querySelector(".btn--forgot-password").innerHTML =
      "Sending Email...";
    const email = document.getElementById("forgot-password-email").value;
    await forgotPassword(email);
    document.querySelector(".btn--forgot-password").innerHTML =
      "Reset Password";
  });
