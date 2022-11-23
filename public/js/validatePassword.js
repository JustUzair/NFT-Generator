const pswd = document.getElementById('signup-password');
const pswdConf = document.getElementById('signup-password-confirm');
const invalidPswd = document.querySelector('.pswd-invalid');
pswdConf.addEventListener('input', (e) => {
	if (e.target.value != pswd.value) {
		// console.log(pswd.value, e.target.value);
		invalidPswd.classList.remove('hidden');
	} else invalidPswd.classList.add('hidden');
});
pswd.addEventListener('input', (e) => {
	if (e.target.value != pswdConf.value) {
		// console.log(e.target.value, pswdConf.value);
		invalidPswd.classList.remove('hidden');
	} else invalidPswd.classList.add('hidden');
});
