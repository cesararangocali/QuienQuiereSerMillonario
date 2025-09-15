import { createI18n } from 'vue-i18n';

const messages = {
  es: {
    appTitle: '¿Quién quiere ser santo?',
    play: 'Jugar', catechesis: 'Catequesis', competitive: 'Competitivo', admin: 'Admin', ranking: 'Ranking',
    correct: '¡Bien hecho!', wrong: 'Sigue caminando en la fe', start: 'Comenzar', yourName: 'Tu nombre',
  },
  en: {
    appTitle: 'Who wants to be a saint?',
    play: 'Play', catechesis: 'Catechesis', competitive: 'Competitive', admin: 'Admin', ranking: 'Ranking',
    correct: 'Well done!', wrong: 'Keep walking in faith', start: 'Start', yourName: 'Your name',
  }
};

export default createI18n({ legacy: false, locale: 'es', fallbackLocale: 'es', messages });
