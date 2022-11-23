const updateSettings = async (data, type) => {
	//type is either password or data
	try {
		const route = type === 'password' ? 'updateMyPassword' : 'updateMe';
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/${route}`,
			data
		});
		if (res.data.status === 'success') {
			showAlert(
				'success',
				`${
					type.charAt(0).toUpperCase() + type.slice(1)
				} Updated Successfully!!`
			);
			window.setTimeout(() => {
				location.assign('/me');
			}, 2500);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

document
	.querySelector('.form.form-user-data')
	?.addEventListener('submit', async (e) => {
		document.querySelector('.user__update--btn').innerHTML = 'Updating...';
		e.preventDefault();
		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		form.append('photo', document.getElementById('photo').files[0]);

		await updateSettings(form, 'data');
		document.querySelector('.user__update--btn').innerHTML =
			'Save settings';
	});
document
	.querySelector('.form-user-password')
	?.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector('.btn--save-password').innerHTML = 'Updating...';
		const passwordCurrent =
			document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm =
			document.getElementById('password-confirm').value;

		await updateSettings(
			{ passwordCurrent, password, passwordConfirm },
			'password'
		);
		document.querySelector('.btn--save-password').innerHTML =
			'Save Password';
	});
