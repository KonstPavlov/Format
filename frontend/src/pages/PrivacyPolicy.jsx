import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { CONTACTS } from "@/constants/data";

// Логотип-марка бренда (дублирует стиль из App.js, чтобы страница выглядела единообразно)
const FormatLogoMark = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ФОРМАТ">
    <rect x="2" y="20" width="11" height="20" fill="currentColor" />
    <rect x="16.5" y="8" width="11" height="32" fill="currentColor" />
    <rect x="31" y="24" width="11" height="16" fill="currentColor" />
    <rect x="5" y="24" width="2" height="2" fill="#F59E0B" />
    <rect x="8" y="24" width="2" height="2" fill="#F59E0B" />
    <rect x="19.5" y="12" width="2" height="2" fill="#F59E0B" />
    <rect x="22.5" y="12" width="2" height="2" fill="#F59E0B" />
    <rect x="34" y="28" width="2" height="2" fill="#F59E0B" />
    <rect x="37" y="28" width="2" height="2" fill="#F59E0B" />
  </svg>
);

const Section = ({ number, title, children }) => (
  <section className="space-y-3">
    <h2 className="font-heading font-black text-lg sm:text-xl text-zinc-900 uppercase tracking-tight">
      {number}. {title}
    </h2>
    <div className="space-y-3 text-sm text-zinc-600 font-body leading-relaxed">
      {children}
    </div>
  </section>
);

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.title = "Политика обработки персональных данных — ФОРМАТ";
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      {/* Шапка */}
      <header className="border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" data-testid="policy-logo-link">
            <FormatLogoMark className="w-10 h-10 text-zinc-900 group-hover:text-amber-600 transition-colors" />
            <span className="font-heading font-black text-xl tracking-wider text-zinc-900">ФОРМАТ</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-zinc-500 hover:text-amber-600 transition-colors"
            data-testid="policy-back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="space-y-2 mb-12">
          <p className="text-[10px] uppercase tracking-widest text-amber-600 font-extrabold">Правовая информация</p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-zinc-900 uppercase tracking-tight leading-tight">
            Политика обработки персональных данных
          </h1>
          <p className="text-xs text-zinc-400 font-body pt-2">Редакция от {new Date().getFullYear()} года. г. {CONTACTS.city}</p>
        </div>

        <div className="space-y-10">
          <Section number="1" title="Общие положения">
            <p>
              Настоящая Политика обработки персональных данных (далее — «Политика») разработана в
              соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и
              определяет порядок обработки персональных данных и меры по обеспечению их безопасности,
              предпринимаемые Оператором.
            </p>
            <p>
              Оператор ставит своей важнейшей целью и условием осуществления своей деятельности
              соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в
              том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.
            </p>
            <p>
              Настоящая Политика применяется ко всей информации, которую Оператор может получить о
              посетителях сайта в сети Интернет по адресу, на котором размещён сайт строительной
              компании «ФОРМАТ» (далее — «Сайт»).
            </p>
          </Section>

          <Section number="2" title="Оператор персональных данных">
            <p>Обработку персональных данных осуществляет:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Наименование: Строительная компания «ФОРМАТ»</li>
              <li>ИНН: <span className="text-zinc-400">[указывается]</span></li>
              <li>ОГРН/ОГРНИП: <span className="text-zinc-400">[указывается]</span></li>
              <li>Адрес: г. {CONTACTS.city} <span className="text-zinc-400">[уточняется]</span></li>
              <li>Контактный телефон: {CONTACTS.phone}</li>
              <li>Адрес электронной почты: {CONTACTS.email}</li>
            </ul>
          </Section>

          <Section number="3" title="Основные понятия">
            <p>
              <b>Персональные данные</b> — любая информация, относящаяся к прямо или косвенно
              определённому или определяемому физическому лицу (субъекту персональных данных).
            </p>
            <p>
              <b>Обработка персональных данных</b> — любое действие (операция) или совокупность действий
              с персональными данными, совершаемых с использованием средств автоматизации или без их
              использования (сбор, запись, систематизация, хранение, уточнение, использование, удаление
              и т. д.).
            </p>
            <p>
              <b>Субъект персональных данных</b> — посетитель Сайта, оставивший свои данные через форму
              обратной связи.
            </p>
          </Section>

          <Section number="4" title="Состав обрабатываемых персональных данных">
            <p>
              Через форму обратной связи на Сайте Оператор осуществляет обработку следующих
              персональных данных, добровольно предоставленных субъектом:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><b>номер телефона</b>.</li>
            </ul>
            <p>
              Дополнительно субъект может по своему усмотрению указать имя и комментарий к заявке. Иные
              персональные данные Оператор через Сайт не собирает. Оператор не осуществляет обработку
              специальных категорий персональных данных и биометрических персональных данных.
            </p>
          </Section>

          <Section number="5" title="Цели обработки персональных данных">
            <p>Персональные данные обрабатываются исключительно в следующих целях:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>обратная связь с субъектом для обработки его заявки, оставленной на Сайте;</li>
              <li>консультирование по вопросам оказываемых Оператором услуг (ремонт и отделка помещений);</li>
              <li>согласование условий выезда специалиста на замер и заключения договора.</li>
            </ul>
            <p>
              Оператор не использует номер телефона для рекламных рассылок без отдельного согласия
              субъекта.
            </p>
          </Section>

          <Section number="6" title="Правовые основания обработки">
            <p>Правовыми основаниями обработки персональных данных являются:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»;</li>
              <li>согласие субъекта персональных данных на обработку его персональных данных,
                предоставляемое путём проставления отметки в форме обратной связи на Сайте;</li>
              <li>договоры, заключаемые между Оператором и субъектом персональных данных.</li>
            </ul>
          </Section>

          <Section number="7" title="Порядок и сроки обработки и хранения">
            <p>
              Обработка персональных данных осуществляется с использованием средств автоматизации и без
              таковых. Персональные данные передаются на адрес электронной почты Оператора и хранятся не
              дольше, чем этого требуют цели их обработки.
            </p>
            <p>
              Персональные данные подлежат уничтожению по достижении целей обработки, при отзыве
              субъектом согласия на обработку, но в любом случае не позднее <b>1 (одного) года</b> с
              момента получения заявки, если иное не предусмотрено законодательством РФ.
            </p>
          </Section>

          <Section number="8" title="Передача персональных данных третьим лицам">
            <p>
              Оператор не передаёт и не раскрывает персональные данные субъектов третьим лицам, за
              исключением случаев:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>получения прямого согласия субъекта персональных данных;</li>
              <li>предоставления данных по запросу уполномоченных государственных органов в порядке,
                установленном законодательством Российской Федерации.</li>
            </ul>
            <p>
              Персональные данные субъектов не передаются за пределы территории Российской Федерации.
            </p>
          </Section>

          <Section number="9" title="Права субъекта персональных данных">
            <p>Субъект персональных данных имеет право:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>получать информацию, касающуюся обработки его персональных данных;</li>
              <li>требовать уточнения, блокирования или уничтожения персональных данных в случае, если
                они являются неполными, устаревшими, неточными или неправомерно обрабатываемыми;</li>
              <li>отозвать согласие на обработку персональных данных;</li>
              <li>обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав
                субъектов персональных данных (Роскомнадзор) или в судебном порядке.</li>
            </ul>
          </Section>

          <Section number="10" title="Порядок отзыва согласия на обработку">
            <p>
              Субъект персональных данных вправе в любой момент отозвать данное им согласие на обработку
              персональных данных. Для этого необходимо направить Оператору соответствующее уведомление
              в свободной форме по телефону {CONTACTS.phone} или на адрес электронной почты{" "}
              {CONTACTS.email}.
            </p>
            <p>
              После получения отзыва согласия Оператор прекращает обработку персональных данных и
              уничтожает их в срок, не превышающий 30 (тридцати) дней, за исключением случаев, когда
              обработка может быть продолжена в соответствии с законодательством РФ.
            </p>
          </Section>

          <Section number="11" title="Заключительные положения">
            <p>
              Оператор имеет право вносить изменения в настоящую Политику. Новая редакция Политики
              вступает в силу с момента её размещения на Сайте, если иное не предусмотрено новой
              редакцией.
            </p>
            <p>
              По всем вопросам, связанным с обработкой персональных данных, субъект может обратиться к
              Оператору по указанным ниже контактам.
            </p>
          </Section>

          {/* Контактный блок */}
          <div className="border border-zinc-200 bg-zinc-50 p-6 sm:p-8 space-y-3">
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-zinc-900">
              Контакты по вопросам обработки персональных данных
            </h3>
            <a
              href={CONTACTS.phoneRaw}
              className="flex items-center gap-2 text-sm text-zinc-900 hover:text-amber-600 transition-colors font-semibold"
              data-testid="policy-contact-phone"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              {CONTACTS.phone}
            </a>
            <p className="text-sm text-zinc-600 font-body">
              Электронная почта:{" "}
              <a href={`mailto:${CONTACTS.email}`} className="underline hover:text-amber-600">
                {CONTACTS.email}
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Подвал */}
      <footer className="bg-[#0A0A0A] py-10 text-center text-[11px] text-zinc-500 font-body">
        &copy; {new Date().getFullYear()} СК ФОРМАТ. Ремонт квартир под ключ в г. {CONTACTS.city}.
      </footer>
    </div>
  );
}
