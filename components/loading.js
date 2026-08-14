/* HabitFlow Loading & Skeleton State Component */

export function createLoadingHTML(message = 'Loading your HabitFlow...') {
  return `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5rem 1.5rem; text-align:center;">
      <div style="width:40px; height:40px; border:4px solid var(--primary-pink-light); border-top-color:var(--primary-pink); border-radius:50%; animation: spin 0.8s linear infinite; margin-bottom:1rem;"></div>
      <p style="font-weight:600; color:var(--text-muted);">${message}</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}
