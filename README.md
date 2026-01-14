# ⚔️ Fatui Website

Site interativo dedicado aos Onze Mensageiros Fatui de Genshin Impact. Carrossel gótico com vídeos dinâmicos que muda automaticamente conforme você navega pelos personagens.

## 🎯 O Que É?

Uma página web que apresenta os 11 vilões mais poderosos de Genshin Impact em um carrossel elegante. Cada Harbinger tem seu próprio card com história, personalidade e motivação.

**Diferencial:** O vídeo de fundo muda automaticamente para combinar com o personagem ativo.

## ✨ Funcionalidades

- **Introdução cinematográfica** com vídeo de Snezhnaya
- **11 cards interativos** dos Fatui Harbingers (Nº 0 ao 11)
- **Vídeos de fundo dinâmicos** que trocam automaticamente
- **Navegação múltipla:**
  - Setas do teclado (← →)
  - Clique nos cards
  - Swipe no mobile
  - Indicadores (11 pontinhos)
- **Design gótico** com cores signature de cada personagem
- **Responsivo** (desktop, tablet, mobile)

## 🚀 Como Usar

1. Abra `index.html` no navegador
2. Assista a introdução épica
3. Role até o carrossel
4. Navegue com **setas ← →** ou **clique nos cards**
5. No mobile: **arraste pro lado**

## 🎨 Design

**Estilo:** Gótico elegante com tema Cryo (gelo)
- Tipografia: Cinzel (gótica) + Montserrat (moderna)
- Paleta: Cores frias dominantes
- Cada personagem tem cor única (Pierro = azul gelo, Arlecchino = vermelho sangue, etc)
- Efeitos glow nos elementos importantes

## 📂 Estrutura

```
fatui-website/
├── index.html              # Página principal
├── style.css               # Visual gótico
├── script.js               # Carrossel e interações
├── resources/              # 12 vídeos MP4 (1 intro + 11 personagens)
│   ├── snezhnaya-main.mp4
│   ├── pierro-bg.mp4
│   ├── capitano-bg.mp4
│   └── ... (até tartaglia-bg.mp4)
└── README.md
```

## 🎮 Personagens Incluídos

0. **Pierro** - "O Bobo" (Azul gelo)
1. **Il Capitano** - "O Capitão" (Cinza aço)
2. **Dottore** - "O Doutor" (Bege claro)
3. **Columbina** - "A Damisela" (Rosa suave)
4. **Arlecchino** - "A Serva" (Vermelho sangue)
5. **Pulcinella** - "O Galo" (Azul royal)
6. **Scaramouche** - "O Baladeiro" (Roxo elétrico)
7. **Sandrone** - "A Marionete" (Rosa escuro)
8. **La Signora** - "A Senhora" (Vermelho intenso)
9. **Pantalone** - "O Regrator" (Azul claro)
11. **Tartaglia** - "Childe" (Amarelo dourado)

*Nota: Não existe Nº 10 (vago no lore oficial)*

## 💡 Objetivo do Projeto

Criado para praticar:
- **Flexbox e Grid** para layouts complexos
- **Carrossel de cards** com JavaScript vanilla
- **Posicionamento CSS avançado** (clip-path, custom properties)
- **Manipulação de vídeos** com HTML5 Video API

## 📧 Contato

- **GitHub:** [@enrique-ss](https://github.com/enrique-ss)
- **Email:** enriqueabyss@gmail.com

---

## 🛠️ Parte Técnica

### **Tech Stack**
- HTML5, CSS3 (Flexbox, Grid, clip-path)
- Vanilla JavaScript (DOM, Event Listeners)
- HTML5 Video API

### **Destaques Técnicos**

**1. Carrossel Centralizado**
```javascript
const offset = -(currentIndex * (cardWidth + gap));
carouselTrack.style.transform = `translateX(calc(50% - ${cardWidth / 2}px + ${offset}px))`;
```
Centraliza card ativo usando cálculo de offset dinâmico.

**2. Cores Dinâmicas com CSS Variables**
```css
[data-character="pierro"] { --card-color: #9bbad1; }
.card-title-gothic { color: var(--card-color); }
```
Uma variável controla título, borda, ornamentos e glow.

**3. Touch Swipe**
```javascript
const diff = touchStartX - touchEndX;
if (Math.abs(diff) > 50) {
    diff > 0 ? nextSlide() : prevSlide();
}
```
Threshold de 50px para navegação mobile.

**4. Troca de Vídeo Sincronizada**
```javascript
const videoSource = activeCard.dataset.video;
bgVideo.src = videoSource;
bgVideo.load();
```
Lê `data-video` do card e atualiza background.

**5. Intersection Observer**
Pausa vídeo quando carrossel sai da tela (economia de recursos).
