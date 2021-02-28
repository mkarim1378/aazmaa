(() => {
    let modes = ['none', 'exam_addQuestion_mode']
    let mode = localStorage.getItem('mode');
    if(!mode || !modes.includes(mode)){
        localStorage.clear();
        localStorage.setItem('mode', 'none');
        return;
    }
    
})()