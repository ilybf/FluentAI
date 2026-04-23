import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { ReadingPassage } from '@/models/ReadingPassage';

/**
 * Pre-written reading passages for all CEFR levels.
 * Two passages per level, each with 3 comprehension questions.
 * No AI API calls — all content is static.
 */
const passages = [
  // ==================== A1 (Beginner) ====================
  {
    title: "My Daily Routine",
    level: "A1",
    content: `My name is Sara. I am 22 years old. I live in a small city.

Every day, I wake up at 7 o'clock. I brush my teeth and take a shower. Then I eat breakfast. I like bread and cheese for breakfast. I drink tea every morning.

I go to work at 8:30. I work in an office. I use a computer. I eat lunch at 12 o'clock. I usually eat a sandwich. After work, I go home. I cook dinner. I like pasta and rice.

In the evening, I watch TV or read a book. I go to bed at 10 o'clock. I like my daily routine. It is simple and nice.`,
    questions: [
      {
        text: "What time does Sara wake up?",
        options: ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"],
        correctIndex: 1,
      },
      {
        text: "What does Sara drink every morning?",
        options: ["Coffee", "Juice", "Tea", "Milk"],
        correctIndex: 2,
      },
      {
        text: "Where does Sara work?",
        options: ["In a school", "In an office", "In a hospital", "In a shop"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "At the Supermarket",
    level: "A1",
    content: `Today is Saturday. I go to the supermarket with my mother. The supermarket is big. It has many things.

First, we go to the fruit section. We buy apples, bananas, and oranges. The apples are red and green. Then, we go to the vegetable section. We buy tomatoes, potatoes, and carrots.

We also buy milk, eggs, and bread. My mother buys chicken for dinner. I want chocolate, but my mother says "Only one!"

We pay at the counter. The total is 45 dollars. We carry the bags to the car. I help my mother put the food in the kitchen. I am a good helper!`,
    questions: [
      {
        text: "What day is it?",
        options: ["Sunday", "Monday", "Friday", "Saturday"],
        correctIndex: 3,
      },
      {
        text: "What fruit do they buy?",
        options: [
          "Apples, bananas, and oranges",
          "Grapes and watermelon",
          "Strawberries and mangoes",
          "Only apples",
        ],
        correctIndex: 0,
      },
      {
        text: "How much do they pay?",
        options: ["25 dollars", "35 dollars", "45 dollars", "55 dollars"],
        correctIndex: 2,
      },
    ],
  },

  // ==================== A2 (Elementary) ====================
  {
    title: "A Weekend Trip to the Beach",
    level: "A2",
    content: `Last weekend, my friends and I went to the beach. We left early in the morning at 6 a.m. because the beach is two hours from our city. We drove there in my friend Tom's car.

When we arrived, the weather was beautiful. The sun was shining and there were no clouds in the sky. We put our towels on the sand and ran into the water. The water was a little cold at first, but then it felt nice.

We played volleyball on the beach and built a sandcastle. At lunchtime, we ate sandwiches and drank cold lemonade. In the afternoon, we went swimming again.

We left the beach at 5 p.m. because we were tired. On the way home, we stopped at a restaurant and ate pizza. It was a wonderful day. We want to go back next month.`,
    questions: [
      {
        text: "What time did they leave for the beach?",
        options: ["5 a.m.", "6 a.m.", "7 a.m.", "8 a.m."],
        correctIndex: 1,
      },
      {
        text: "What was the weather like?",
        options: ["Rainy", "Cloudy", "Beautiful and sunny", "Windy"],
        correctIndex: 2,
      },
      {
        text: "What did they eat on the way home?",
        options: ["Sandwiches", "Hamburgers", "Ice cream", "Pizza"],
        correctIndex: 3,
      },
    ],
  },
  {
    title: "My Favourite Hobby",
    level: "A2",
    content: `My name is Carlos and my favourite hobby is cooking. I started cooking when I was 15 years old. My grandmother taught me how to make simple dishes like omelettes and soup.

Now I can cook many different things. I like to make Italian food, especially pasta and pizza. I also enjoy making desserts. My best dessert is chocolate cake. My family loves it!

I usually cook on weekends because I am busy during the week with work. On Saturdays, I go to the market to buy fresh vegetables, meat, and spices. Then I spend the afternoon in the kitchen.

Sometimes, I invite my friends for dinner. They always say my food is delicious. I feel very happy when people enjoy my cooking. In the future, I want to take a professional cooking course.`,
    questions: [
      {
        text: "Who taught Carlos to cook?",
        options: ["His mother", "His grandmother", "His father", "His friend"],
        correctIndex: 1,
      },
      {
        text: "What is Carlos's best dessert?",
        options: ["Apple pie", "Cheesecake", "Chocolate cake", "Ice cream"],
        correctIndex: 2,
      },
      {
        text: "When does Carlos usually cook?",
        options: ["Every day", "On weekdays", "On weekends", "Only on Mondays"],
        correctIndex: 2,
      },
    ],
  },

  // ==================== B1 (Intermediate) ====================
  {
    title: "The Impact of Social Media on Young People",
    level: "B1",
    content: `Social media has become a huge part of everyday life, especially for young people. Platforms like Instagram, TikTok, and YouTube are used by millions of teenagers and young adults around the world. While social media has many advantages, it also has some serious disadvantages.

On the positive side, social media helps people stay connected with friends and family, even if they live far away. It is also a great tool for learning new things. Many people watch educational videos or follow accounts that teach languages, science, or cooking. Additionally, social media gives young people a platform to express their creativity through photos, videos, and writing.

However, there are also negative effects. Many studies show that spending too much time on social media can lead to anxiety and depression. Young people often compare themselves to others online, which can make them feel bad about their appearance or their life. Cyberbullying is another serious problem. Some people use social media to say hurtful things to others.

Experts recommend that young people limit their screen time to one or two hours per day. It is also important to remember that what people post online is usually only the best parts of their life, not the full picture. Being aware of these issues can help young people use social media in a healthier way.`,
    questions: [
      {
        text: "According to the passage, what is one advantage of social media?",
        options: [
          "It makes people famous",
          "It helps people stay connected with others",
          "It replaces education",
          "It earns money for users",
        ],
        correctIndex: 1,
      },
      {
        text: "What negative effect can too much social media cause?",
        options: [
          "Better sleep",
          "More exercise",
          "Anxiety and depression",
          "Improved grades",
        ],
        correctIndex: 2,
      },
      {
        text: "How much screen time do experts recommend per day?",
        options: [
          "30 minutes",
          "1-2 hours",
          "4-5 hours",
          "No limit",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "Working from Home: The New Normal",
    level: "B1",
    content: `Since 2020, working from home has become very common in many countries. Before the pandemic, most people went to an office every day. Now, millions of people work remotely, either full-time or part-time. This change has affected both employees and companies in many ways.

There are several benefits of working from home. Employees save time and money because they do not need to commute. They can also have a more flexible schedule, which means they can spend more time with their families. Many people say they are more productive at home because there are fewer distractions from colleagues.

On the other hand, working from home has some challenges. Some employees feel lonely because they do not see their colleagues face-to-face. It can also be difficult to separate work life from personal life when your office is in your living room. Some people work longer hours because they feel they need to be available all the time.

Companies are now trying to find a balance. Many offer a "hybrid" model, where employees work from home two or three days a week and go to the office for the rest. This seems to be a good solution for both sides. The future of work is changing, and remote work will likely continue to be an important option for many people.`,
    questions: [
      {
        text: "Why do employees save money when working from home?",
        options: [
          "They get higher salaries",
          "They do not need to commute",
          "They do not pay taxes",
          "They work fewer hours",
        ],
        correctIndex: 1,
      },
      {
        text: "What is one challenge of working from home?",
        options: [
          "Too many holidays",
          "Easy to separate work and personal life",
          "Feeling lonely without colleagues",
          "Having a better commute",
        ],
        correctIndex: 2,
      },
      {
        text: "What is a 'hybrid' work model?",
        options: [
          "Working only from home",
          "Working only from the office",
          "A mix of home and office days",
          "Working in different countries",
        ],
        correctIndex: 2,
      },
    ],
  },

  // ==================== B2 (Upper Intermediate) ====================
  {
    title: "The Psychology Behind Procrastination",
    level: "B2",
    content: `Almost everyone has experienced procrastination at some point — putting off an important task in favour of something more enjoyable or less demanding. While it is often dismissed as laziness, psychologists argue that procrastination is far more complex than that. In fact, research suggests it is primarily an emotional regulation problem, not a time management one.

Dr. Tim Pychyl, a leading researcher on the topic, explains that when we face a task we find boring, frustrating, or anxiety-inducing, our brain's limbic system — the part responsible for emotions — triggers an avoidance response. We seek immediate relief by turning to activities that provide instant gratification, such as scrolling through social media or watching videos. The prefrontal cortex, which handles rational thinking and planning, is essentially overridden.

The consequences of chronic procrastination can be significant. Studies have linked it to higher levels of stress, lower academic and professional performance, and even physical health problems. Procrastinators often experience guilt and shame, which paradoxically makes them more likely to procrastinate in the future, creating a vicious cycle.

So how can we break the habit? Experts suggest several strategies. First, breaking large tasks into smaller, more manageable steps can reduce the feeling of being overwhelmed. Second, setting specific deadlines — rather than vague goals — creates a sense of urgency. Third, practising self-compassion instead of self-criticism can help interrupt the guilt cycle. Finally, removing distractions from your environment can make it easier for your prefrontal cortex to stay in control.`,
    questions: [
      {
        text: "According to psychologists, procrastination is primarily a problem of:",
        options: [
          "Time management",
          "Laziness",
          "Emotional regulation",
          "Intelligence",
        ],
        correctIndex: 2,
      },
      {
        text: "What part of the brain triggers the avoidance response?",
        options: [
          "The prefrontal cortex",
          "The cerebellum",
          "The limbic system",
          "The hippocampus",
        ],
        correctIndex: 2,
      },
      {
        text: "Which strategy is NOT mentioned for overcoming procrastination?",
        options: [
          "Breaking tasks into smaller steps",
          "Setting specific deadlines",
          "Punishing yourself for delays",
          "Removing distractions",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "The Rise of Electric Vehicles",
    level: "B2",
    content: `The automotive industry is undergoing one of its most significant transformations since the invention of the automobile. Electric vehicles (EVs), once considered a niche product for environmentally conscious consumers, are now rapidly entering the mainstream market. Major manufacturers including Toyota, Volkswagen, and General Motors have committed to transitioning large portions of their fleets to electric power within the next decade.

Several factors are driving this shift. Government regulations aimed at reducing carbon emissions have set strict targets that conventional petrol and diesel vehicles cannot meet. In the European Union, for example, new legislation effectively bans the sale of combustion engine cars from 2035. Meanwhile, consumers are increasingly attracted to EVs because of lower running costs — electricity is considerably cheaper than petrol, and electric motors require far less maintenance than internal combustion engines.

However, significant challenges remain. The most frequently cited concern is "range anxiety" — the fear that an EV's battery will run out before reaching a charging station. Although modern EVs can typically travel 300-500 kilometres on a single charge, the charging infrastructure in many regions is still inadequate. Charging times, which can range from 30 minutes to several hours, also compare unfavourably with the few minutes required to fill a petrol tank.

The environmental picture is also more nuanced than it might appear. While EVs produce zero tailpipe emissions, the production of their lithium-ion batteries involves mining operations that can cause significant environmental damage. Furthermore, the electricity used to charge these vehicles is not always generated from renewable sources. Despite these complexities, most experts agree that EVs represent a crucial step towards reducing transport-related carbon emissions.`,
    questions: [
      {
        text: "From what year does EU legislation effectively ban new combustion engine cars?",
        options: ["2025", "2030", "2035", "2040"],
        correctIndex: 2,
      },
      {
        text: "What is 'range anxiety'?",
        options: [
          "Fear of driving too fast",
          "Fear the battery will run out before reaching a charger",
          "Fear of high electricity costs",
          "Fear of new technology",
        ],
        correctIndex: 1,
      },
      {
        text: "What environmental concern does the passage raise about EVs?",
        options: [
          "They are too noisy",
          "They use too much water",
          "Battery production involves harmful mining",
          "They cause more traffic congestion",
        ],
        correctIndex: 2,
      },
    ],
  },

  // ==================== C1 (Advanced) ====================
  {
    title: "The Ethics of Artificial Intelligence in Healthcare",
    level: "C1",
    content: `The integration of artificial intelligence into healthcare systems presents a fascinating paradox: a technology with the potential to save millions of lives simultaneously raises profound ethical questions that the medical profession is only beginning to grapple with. From diagnostic algorithms that can identify cancers more accurately than experienced radiologists to AI systems that predict patient deterioration hours before human clinicians notice warning signs, the capabilities are genuinely remarkable. Yet beneath these achievements lie thorny issues of accountability, bias, and the fundamental nature of the doctor-patient relationship.

One of the most pressing concerns involves algorithmic bias. AI systems learn from historical data, and if that data reflects existing inequalities in healthcare provision — which it invariably does — the resulting algorithms can perpetuate and even amplify those disparities. A well-documented example occurred with a widely used healthcare algorithm in the United States that systematically underestimated the health needs of Black patients compared to White patients with similar conditions. The algorithm used healthcare spending as a proxy for health needs, but because Black patients historically had less access to healthcare, their spending was lower, leading the system to conclude they were healthier than they actually were.

The question of accountability is equally complex. When an AI system recommends a treatment that proves harmful, who bears responsibility? The developer who designed the algorithm? The hospital that deployed it? The physician who followed its recommendation? Traditional medical malpractice frameworks were not designed for scenarios involving autonomous decision-making systems, and legal scholars are struggling to adapt existing frameworks to this new reality.

Perhaps most fundamentally, the increasing role of AI challenges the relational dimension of medicine. Patients consistently report that empathy, attentive listening, and the feeling of being understood by their doctor are essential components of healing. While AI can process vast quantities of data with superhuman speed and accuracy, it cannot — at least not yet — replicate the human capacity for genuine compassion. The challenge for healthcare systems is to harness AI's analytical power while preserving the irreplaceable human elements of care.`,
    questions: [
      {
        text: "What caused the US healthcare algorithm to underestimate Black patients' health needs?",
        options: [
          "It used genetic data that was incomplete",
          "It used healthcare spending as a proxy for health needs",
          "It was only trained on data from White patients",
          "It was deliberately designed to discriminate",
        ],
        correctIndex: 1,
      },
      {
        text: "What does the passage identify as a fundamental challenge with AI accountability in medicine?",
        options: [
          "AI systems are too expensive for hospitals",
          "Traditional malpractice frameworks don't cover autonomous systems",
          "Doctors refuse to use AI recommendations",
          "AI developers cannot be identified",
        ],
        correctIndex: 1,
      },
      {
        text: "According to the passage, what can AI NOT yet replicate in healthcare?",
        options: [
          "Accurate diagnoses",
          "Processing large datasets",
          "Genuine human compassion",
          "Predicting patient deterioration",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "The Decline of Deep Reading in the Digital Age",
    level: "C1",
    content: `Cognitive neuroscientist Maryanne Wolf has spent decades studying how the human brain processes written language, and her recent work has raised alarming questions about the impact of digital media on our capacity for what she terms "deep reading" — the kind of slow, immersive, reflective engagement with text that has historically been central to intellectual development and cultural transmission.

Wolf argues that the brain's reading circuitry is not innate; unlike spoken language, reading is a learned skill that requires the brain to repurpose neural pathways originally evolved for other functions, such as pattern recognition and language processing. This plasticity, which makes reading possible in the first place, also makes it vulnerable. When we consistently read in the fragmented, hyperlinked, notification-interrupted manner characteristic of digital environments, the brain's reading circuits gradually adapt to favour rapid information extraction over sustained contemplation.

The implications extend beyond personal enrichment. Deep reading activates regions of the brain associated with empathy, enabling readers to inhabit other perspectives and understand experiences different from their own. It also engages the prefrontal cortex in ways that facilitate critical analysis and complex reasoning. Several studies have demonstrated that comprehension of nuanced arguments and detection of rhetorical manipulation are significantly better when subjects read printed texts compared to digital equivalents, even when the content is identical.

This does not mean that digital reading is without value — it excels at facilitating rapid access to information and enabling cross-referential research. Rather, the concern is that as deep reading skills atrophy from disuse, society may lose the cognitive capacities that depend on them. Wolf advocates for what she calls a "biliterate brain" — one equally comfortable with both deep, linear reading and the skimming, scanning strategies demanded by digital environments. Achieving this, she acknowledges, will require deliberate cultivation, particularly in educational settings where digital devices are increasingly dominant.`,
    questions: [
      {
        text: "Why is the brain's reading circuitry vulnerable to change, according to Wolf?",
        options: [
          "Because reading is genetically programmed",
          "Because the plasticity that enables reading also allows it to be reshaped",
          "Because digital screens damage the eyes",
          "Because children learn to read too early",
        ],
        correctIndex: 1,
      },
      {
        text: "What cognitive benefit of deep reading does the passage specifically link to empathy?",
        options: [
          "Faster information processing",
          "Better vocabulary acquisition",
          "The ability to inhabit other perspectives",
          "Improved memory retention",
        ],
        correctIndex: 2,
      },
      {
        text: "What does Wolf mean by a 'biliterate brain'?",
        options: [
          "A brain that can read two languages",
          "A brain comfortable with both deep reading and digital scanning",
          "A brain that prefers printed books",
          "A brain trained exclusively on digital content",
        ],
        correctIndex: 1,
      },
    ],
  },

  // ==================== C2 (Mastery) ====================
  {
    title: "The Paradox of Choice and Decision Fatigue",
    level: "C2",
    content: `In his influential 2004 work "The Paradox of Choice," psychologist Barry Schwartz challenged the deeply ingrained Western assumption that maximising individual choice invariably maximises individual welfare. Drawing on extensive research in behavioural economics and cognitive psychology, Schwartz argued that while some degree of choice is undoubtedly preferable to none, the relationship between the number of available options and subjective well-being follows an inverted U-curve: beyond a certain threshold, additional choices cease to liberate and begin to tyrannise.

The mechanisms through which excessive choice undermines satisfaction are multifaceted. Opportunity cost — the awareness that selecting one option necessarily entails forgoing others — becomes increasingly painful as the number of alternatives grows. Analysis paralysis, wherein the sheer volume of options renders decision-making so cognitively taxing that individuals defer or avoid the decision altogether, represents another well-documented consequence. Furthermore, the more options available, the more likely an individual is to experience post-decision regret, continually wondering whether a different selection might have yielded superior outcomes. This phenomenon is particularly pronounced among what Schwartz terms "maximisers" — individuals who habitually seek the optimal choice rather than one that is merely satisfactory.

Subsequent research has both refined and contested Schwartz's thesis. A comprehensive meta-analysis by Scheibehenne, Greifeneder, and Todd (2010) found that the "choice overload" effect, while real, is considerably more context-dependent than Schwartz's original formulation suggested. Variables such as the complexity of the decision, the decision-maker's expertise in the relevant domain, and the degree to which preferences are well-articulated prior to the choice all modulate whether additional options help or hinder. In domains where individuals possess clear preferences and adequate knowledge, more choice tends to be beneficial; where preferences are vague and expertise is lacking, the paralysing effects are most acute.

The implications for institutional design are substantial. Policy architects, from supermarket retailers to government administrators designing pension schemes, increasingly recognise that how choices are structured — what Thaler and Sunstein famously termed "choice architecture" — may matter more than how many choices are offered. Default options, curated recommendation systems, and tiered decision frameworks represent pragmatic attempts to preserve the benefits of choice while mitigating its cognitive costs, an approach that navigates the tension between libertarian ideals of individual autonomy and the psychological realities of bounded rationality.`,
    questions: [
      {
        text: "What shape does Schwartz argue describes the relationship between choice and well-being?",
        options: [
          "A straight upward line",
          "An inverted U-curve",
          "A downward slope",
          "An exponential curve",
        ],
        correctIndex: 1,
      },
      {
        text: "According to the passage, what distinguishes a 'maximiser'?",
        options: [
          "Someone who makes decisions quickly",
          "Someone who avoids making decisions",
          "Someone who habitually seeks the optimal choice",
          "Someone who is satisfied with any option",
        ],
        correctIndex: 2,
      },
      {
        text: "What did the 2010 meta-analysis by Scheibehenne et al. conclude?",
        options: [
          "Choice overload does not exist",
          "Choice overload is universal regardless of context",
          "Choice overload is more context-dependent than originally proposed",
          "More choice is always beneficial",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Linguistic Relativity: Does Language Shape Thought?",
    level: "C2",
    content: `The question of whether the language one speaks fundamentally shapes one's perception of reality — known variously as the Sapir-Whorf hypothesis, linguistic relativity, or linguistic determinism in its strongest formulation — has oscillated between intellectual respectability and dismissal throughout the twentieth and twenty-first centuries, reflecting broader shifts in the cognitive sciences' understanding of the relationship between language and thought.

In its strongest version, associated primarily with Benjamin Lee Whorf's analysis of Hopi temporal concepts in the 1940s, the hypothesis posits that language determines thought: speakers of languages with radically different grammatical structures literally perceive and conceptualise reality in incommensurable ways. This deterministic formulation fell into disrepute during the Chomskyan revolution of the 1960s and 1970s, which emphasised the universal deep structures underlying all human languages and implicitly relegated surface-level grammatical variation to cognitive insignificance.

However, a renaissance of empirical research beginning in the late 1990s has rehabilitated a more nuanced version of the hypothesis. Lera Boroditsky's cross-linguistic studies have produced particularly compelling evidence. Her research with Mandarin and English speakers demonstrates that the vertical spatial metaphors for time prevalent in Mandarin (earlier events are conceptualised as "up," later events as "down") measurably influence temporal reasoning, even in non-linguistic tasks. Similarly, studies of the Kuuk Thaayorre people of Australia, whose language Kuuk Thaayorre uses absolute cardinal directions rather than relative spatial terms (saying "the cup is to the southeast of the plate" rather than "the cup is to the right of the plate"), reveal that speakers maintain a remarkably precise mental compass and spontaneously organise temporal sequences according to cardinal rather than egocentric axes.

These findings suggest that while language does not imprison thought within rigid categorical boundaries — the strong deterministic claim that Whorf's critics rightly challenged — it does exert a significant habitual influence on cognition, functioning as what Slobin termed "thinking for speaking." The language one speaks does not render certain thoughts impossible, but it renders certain patterns of attention, categorisation, and reasoning more natural and cognitively available than others, subtly but measurably shaping the landscape of habitual thought.`,
    questions: [
      {
        text: "Why did the strong version of the Sapir-Whorf hypothesis fall into disrepute?",
        options: [
          "Whorf's original data was fabricated",
          "The Chomskyan revolution emphasised universal deep structures of language",
          "No cross-linguistic research was conducted",
          "It was proven that all languages are identical",
        ],
        correctIndex: 1,
      },
      {
        text: "What does Boroditsky's research on Mandarin speakers demonstrate?",
        options: [
          "Mandarin speakers cannot understand English time concepts",
          "Vertical spatial metaphors for time influence temporal reasoning in non-linguistic tasks",
          "Mandarin has no way to express past events",
          "English speakers process time faster than Mandarin speakers",
        ],
        correctIndex: 1,
      },
      {
        text: "What does the passage conclude about linguistic relativity?",
        options: [
          "Language completely determines all thought",
          "Language has no influence on cognition whatsoever",
          "Language does not make thoughts impossible but makes certain patterns more cognitively available",
          "Only non-Western languages influence thought",
        ],
        correctIndex: 2,
      },
    ],
  },
];

export async function POST() {
  try {
    await dbConnect();

    // Check if passages already exist to avoid duplicates
    const existingCount = await ReadingPassage.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Database already has ${existingCount} passages. Skipping seed to avoid duplicates.`,
        count: existingCount,
      });
    }

    const result = await ReadingPassage.insertMany(passages);

    return NextResponse.json({
      message: `Successfully seeded ${result.length} reading passages across all CEFR levels.`,
      count: result.length,
      levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Failed to seed reading passages' }, { status: 500 });
  }
}
