package com.nucleo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.NoteAdd
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.*
import java.util.UUID

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { NucleoApp() } }
    }
}

@Composable
private fun NucleoApp() {
    val nav = rememberNavController()
    Scaffold(bottomBar = {
        NavigationBar {
            NavigationBarItem(selected = false, onClick = { nav.navigate("new") }, icon = { Icon(Icons.Outlined.NoteAdd, null) }, label = { Text("Nuevo") })
            NavigationBarItem(selected = false, onClick = { nav.navigate("history") }, icon = { Icon(Icons.Outlined.History, null) }, label = { Text("Historial") })
        }
    }) { padding ->
        NavHost(navController = nav, startDestination = "new", modifier = Modifier.padding(padding)) {
            composable("new") { CreateMapScreen() }
            composable("history") { HistoryScreen() }
        }
    }
}

@Composable
private fun CreateMapScreen() {
    var text by rememberSaveable { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Núcleo", style = MaterialTheme.typography.headlineMedium)
        OutlinedTextField(value = text, onValueChange = { text = it }, label = { Text("Pega texto o un enlace") }, modifier = Modifier.fillMaxWidth().weight(1f))
        Button(onClick = { /* ViewModel calls ApiClient and persists an optimistic map. */ }, modifier = Modifier.fillMaxWidth(), enabled = text.isNotBlank()) { Text("Crear mapa") }
    }
}

@Composable
private fun HistoryScreen() {
    Column(Modifier.fillMaxSize().padding(20.dp)) { Text("Historial", style = MaterialTheme.typography.headlineMedium); Text("Los mapas se guardarán sin conexión y se sincronizarán al iniciar sesión.") }
}
