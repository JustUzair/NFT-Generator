const resetPassword = async (password, passwordConfirm, resetToken) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/resetPassword/${resetToken}`,
			data: {
				password,
				passwordConfirm
			}
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Password has been reset successfully');
			window.setTimeout(() => {
				location.assign('/');
			}, 3500);
		}
		// console.log(res);
	} catch (err) {
		showAlert('error', err.response.data.message);
		// console.log(err.response.data.message);
	}
};

document
	.querySelector('.form--reset-password ')
	?.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector('.btn--reset-password').innerHTML =
			'Updating Password...';
		const password = document.getElementById('reset-password').value;
		const passwordConfirm = document.getElementById(
			'reset-password-confirm'
		).value;
		if (password != passwordConfirm)
			showAlert('error', 'Password and Confirm Password should be same!');
		else {
			await resetPassword(
				password,
				passwordConfirm,
				window.location.pathname.split('/')[2]
			);
			// window.location.pathname.split('/').map((element) => {
			// 	console.log(element);
			// });
			// console.log(window.location.pathname.split('/')[2]);
		}
		document.querySelector('.btn--reset-password').innerHTML =
			'Reset Password';
	});
