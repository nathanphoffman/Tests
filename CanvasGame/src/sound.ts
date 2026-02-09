export function playMusic() {
    let audio = document.getElementById("audio");
    if(!audio) return;
    audio.muted = true; // Mute before playing
    audio.play().then(() => {
        audio.muted = false; // Unmute after playback starts
    }).catch(error => {
        console.error('Error playing audio:', error);
        alert('Playback failed, please check your browser settings.');
    });
}