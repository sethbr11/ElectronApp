// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require('electron');

// Update progress when receiving 'update-progress' from main process
ipcRenderer.on('update-progress', (event, percent) => {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${Math.round(percent)}%`;
  }
  else {
    console.log('Progress bar not found');
  }
});