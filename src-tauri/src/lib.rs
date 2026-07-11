use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Manager,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_inspector(window: tauri::WebviewWindow) {
    #[cfg(debug_assertions)]
    window.open_devtools();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .menu(|app| {
            let close = MenuItem::with_id(
                app,
                "close-window",
                "Close Window",
                true,
                Some("Cmd+Shift+W"),
            )?;
            Menu::with_items(
                app,
                &[
                    &Submenu::with_items(
                        app,
                        "DarkForestEditor",
                        true,
                        &[
                            &PredefinedMenuItem::about(app, None, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::services(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::hide(app, None)?,
                            &PredefinedMenuItem::hide_others(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::quit(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(app, "File", true, &[&close])?,
                    &Submenu::with_items(
                        app,
                        "Edit",
                        true,
                        &[
                            &PredefinedMenuItem::undo(app, None)?,
                            &PredefinedMenuItem::redo(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::cut(app, None)?,
                            &PredefinedMenuItem::copy(app, None)?,
                            &PredefinedMenuItem::paste(app, None)?,
                            &PredefinedMenuItem::select_all(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Window",
                        true,
                        &[
                            &PredefinedMenuItem::minimize(app, None)?,
                            &PredefinedMenuItem::maximize(app, None)?,
                        ],
                    )?,
                ],
            )
        })
        .on_menu_event(|app, event| {
            if event.id() == "close-window" {
                let _ = app.get_webview_window("main").unwrap().close();
            }
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, open_inspector])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
