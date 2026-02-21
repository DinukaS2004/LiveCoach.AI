import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Data Structure 
const CRICKET_DATA: Record<string, any> = {
  'COVER DRIVE': {
    difficulty: '4/10', 
    description: 'A classic front-foot drive played with a vertical bat, where the batsman steps forward towards the pitch of the ball, leans into the line, and swings through with a high elbow and full follow-through. The ball is struck through the covers (between extra cover and point) along the ground or slightly lofted.',
    imageUrl: require('../../../assets/tutorials/Coverdrive.png'), 
    videoUrl: 'https://youtu.be/h3N-BRQXTS4?si=bJNl44W-7UiN2Ngv', 
    risks: 'Mistiming can result in a thick edge to the slips or gully, or playing inside the line and missing the ball entirely. The front leg can get in the way if the stride is too big.',
    whenToUse: 'Against full-length or slightly overpitched deliveries outside off stump, particularly when the off-side field is spread or the bowler is swinging the ball away. Ideal for building an innings with elegant boundaries.',
    exponents: 'Kumar Sangakkara, Virat Kohli, Mark Waugh'
  },
  'FRONT FOOT DEFENCE': {
    difficulty: '2/10',
    description: 'The classic forward defensive, played to good-length balls by stepping forward with the front foot, head over the ball, bat straight and close to the pad, presenting the full face to block the delivery. Soft hands help kill the pace.',
    imageUrl: require('../../../assets/tutorials/Frontfoot.png'),
    videoUrl:'',
    risks: 'Playing too early can lead to a leading edge or bat-pad catch; too late and the ball may sneak through to the stumps. Vulnerable to late swing or seam.',
    whenToUse: 'To defend against full or good-length balls on or outside off stump from pace or spin, particularly early in the innings or against accurate bowling.',
    exponents: 'Rahul Dravid, Sunil Gavaskar, Sachin Tendulkar'
  },
  'BACK FOOT DEFENCE': {
    difficulty: '2/10',
    description: 'A solid defensive shot played off the back foot to short-of-a-length or rising deliveries. The batsman moves the back foot across towards the stumps, keeps the bat vertical and angled slightly downward, head over the ball, and presents the full face to deaden the delivery.',
    imageUrl: require('../../../assets/tutorials/Backfoot.png'),
    videoUrl:'',
    risks: 'If the bat is not straight or the hands are too high, the ball can squirt to the slips or produce a catch. Exposes the body more than the front-foot version.',
    whenToUse: 'Against pace bowlers on good to back-of-a-length deliveries pitching on or around off stump, especially when the ball is seaming or bouncing. Essential for survival in seaming conditions.',
    exponents: 'Rahul Dravid, Jacques Kallis, Alastair Cook'
  },
  'STRAIGHT DRIVE': {
    difficulty: '5/10',
    description: 'A vertical-bat drive played straight down the ground past the bowler. The batsman takes a full stride forward, keeps the bat perfectly straight through the line of the ball, and extends the arms fully in the follow-through for elegance and power.',
    imageUrl: require('../../../assets/tutorials/Straightdrive.png'),
    videoUrl:'',
    risks: 'The ball can go straight back to the bowler or mid-on if slightly mistimed; requires perfect balance to avoid being caught in the V.',
    whenToUse: 'Against full-length deliveries on the stumps or just outside off, when the bowler overpitches and mid-on is vacant or deep. One of the most satisfying shots when timed perfectly.',
    exponents: 'Sachin Tendulkar, Brian Lara, Ricky Ponting'
  },
  'SQUARE CUT': {
    difficulty: '5/10',
    description: 'A horizontal-bat shot played off the back foot to short, wide deliveries outside off stump. The batsman rocks back, opens the bat face, and cuts the ball square through the point region using the bowler\'s pace.',
    imageUrl: require('../../../assets/tutorials/Squarecut.png'),
    videoUrl:'',
    risks: 'Top edge can fly to gully or third man; mistiming often leads to catches in the off-side cordon. Requires precise footwork.',
    whenToUse: 'Against short and wide balls from pace bowlers, especially when the point and gully fields are up or vacant. Great for quick boundaries in powerplays.',
    exponents: 'Kumar Sangakkara, Sanath Jayasuriya, Sachin Tendulkar'
  },
  'FLICK': {
    difficulty: '4/10',
    description: 'A wristy leg-side shot, often played to balls on or outside leg stump. Using soft hands and strong bottom-hand wrists, the batsman flicks the ball through mid-wicket or square leg with a straight bat angled slightly to the on-side. Can be played off front or back foot.',
    imageUrl: require('../../../assets/tutorials/Flick.png'),
    videoUrl:'',
    risks: 'Leading edge back to the bowler or mid-on; aerial flicks can be caught in the deep.',
    whenToUse: 'Against full or good-length balls drifting onto the pads, ideal for rotating strike or picking boundaries when leg-side fielders are sparse.',
    exponents: 'Virat Kohli, Michael Hussey'
  },
  'PULL SHOT': {
    difficulty: '6/10',
    description: ' A horizontal-bat shot played to short balls around waist height. The batsman swivels on the back foot, pulls the bat across the body in a controlled arc, and rolls the wrists to keep the ball down, directing it to mid-wicket or square leg.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'op edge to deep square leg or fine leg; mistimed pulls can balloon up for easy catches.',
    whenToUse: 'Against short-pitched deliveries not too high, when the leg-side boundary is open and the bowler is predictable.',
    exponents: 'Rohit Sharma, Ricky Ponting, Viv Richards'
  },
  'HOOK SHOT': {
    difficulty: '7/10',
    description: 'An aggressive horizontal-bat shot to bouncers at or above chest height. Similar to the pull but played later and higher, the batsman hooks the ball behind square on the leg side, often aerially, using quick reflexes and strong upper body.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'High chance of top edge to fine leg or deep backward square; exposes the head and gloves.',
    whenToUse: 'Against short, rising deliveries from pace bowlers when the leg-side field is up and the batsman wants to dominate.',
    exponents: 'Ricky Ponting, David Warner, Brian Lara'
  },
  'RAMP' : {
    difficulty: '6/10',
    description: "A modern unorthodox shot played to short-pitched straight balls. The batsman gets inside the line, angles the bat horizontally or upward behind the wicket, and ramps the ball over the slips, wicketkeeper, or fine leg using the bowler's pace.",
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: ' Caught by fine leg or wicketkeeper if mistimed; requires excellent hand-eye coordination.',
    whenToUse: 'Against pace bowlers bowling short at the body when the field behind square is up, common in T20 and ODIs.',
    exponents: 'Jos Buttler, AB de Villiers, Rishabh Pant'
  },
  'SCOOP': {
    difficulty: '8/10',
    description: " An audacious shot where the batsman kneels or stays low to full or yorker-length deliveries, gets underneath the ball, and scoops it with a horizontal bat or upward flick over the wicketkeeper's head to fine leg or beyond. Variants include the Dilscoop.",
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'Very high—wicketkeeper can take a simple catch, or the batsman can be stumped or bowled if the bat misses. Defenceless against a good yorker.',
    whenToUse: 'In limited-overs cricket against pace bowlers when the field is up behind square and the batsman needs quick runs off good-length balls.',
    exponents: 'Tillakaratne Dilshan, Brendon McCullum, Jos Buttler'
  },
  'REVERSE SWEEP':{
    difficulty: '5/10',
    description: 'Using an unchanged grip and orthodox stance, a batsman swings around his front shoulder from leg to off horizontally to access the off-side.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'Hard to control, often aerial, exposes front leg.',
    whenToUse: 'When the leg-side perimeter is protected and the off-side field is up inside the circle, the reverse-sweep, when executed properly, penetrates the field to find the boundary from cover to third man.',
    exponents: 'Glenn Maxwell, Mike Hussey'
  },
  'SLOG SWEEP':{
    difficulty: '7/10',
    description: 'An aggressive, power-oriented variation of the sweep, often played aerially for big scores. The batsman adopts a similar low, kneeling position but opens up the stance more, gets the front leg out of the way, swings the bat harder with straight arms and a full, explosive follow-through from high to low to high. The focus is on getting under the ball to loft it powerfully over mid-wicket, cow corner, or deep square leg, often aiming for sixes rather than keeping it down',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'Significantly higher aerial risk—top edge to deep backward square or mid-wicket; miscued shots can balloon up for easy catches; lbw or bowled if completely missed against fuller lengths; requires excellent timing and power, making it prone to failure under pressure.',
    whenToUse: 'Against spinners or even pace bowlers when quick boundaries or sixes are needed, the leg side is open or deep fielders are placed, and the batsman is set. Best for big overs or when the run rate demands acceleration.',
    exponents: 'Rohit Sharma, Shane Watson,  Glenn Maxwell'
  },
  'SWEEP': {
    difficulty: '5/10',
    description: 'The conventional (or hard) sweep is a defensive yet productive front-foot cross-batted shot primarily against spin bowling. The batsman gets low by kneeling on one knee (back knee often on the ground), stretches forward with the front foot, keeps the head over the ball, and sweeps the bat horizontally low across the body in a controlled arc. The ball is typically rolled along the ground or kept down towards square leg or fine leg, using soft hands and wrist control to minimize elevation.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks: 'Top edge can loop up to backward square leg or short fine leg; lbw if the ball is too full and the batsman misses or gets hit on the pad; playing against sharp turn or bounce increases the chance of miscuing or edging.',
    whenToUse: "Against spinners bowling full or good-length deliveries on or around leg stump or outside off, especially on turning or slow pitches where using the feet is risky. Ideal for rotating strike, disrupting the bowler's line, or scoring safely when the leg side is under-populated.",
    exponents: 'AB de Villiers , Ross Taylor , Joe Root'
  },
  'ON DRIVE':{
    difficulty: '6/10',
    description:'A classic front-foot drive played straight down the ground but angled towards the on-side (mid-on or long-on region). The batsman steps forward decisively to the pitch of the ball, keeps the bat straight through the line, leans into the shot with weight transferred to the front foot, high elbow, and a full follow-through. It requires perfect balance, timing, and alignment to hit the ball fluently along the ground or slightly lofted. Often considered one of the most technically demanding drives due to the need for precise footwork and body positioning.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'Mistiming can lead to a leading edge back to the bowler or mid-on; playing across the line slightly risks lbw or inside edge onto the stumps; requires excellent judgment of length as fuller balls are ideal but overpitching can make it hard to control.',
    whenToUse:'Against full-length deliveries on or around middle/leg stump from pace or spin, particularly when mid-on is deep or vacant, allowing elegant boundaries or rotation of strike. Best on good batting surfaces.',
    exponents:'Sachin Tendulkar, Virat Kohli, Brian Lara, Kumar Sangakkara'
  },
  'SQUARE DRIVE':{
    difficulty: '5/10',
    description:'A front-foot drive played to wider deliveries outside off stump, directing the ball square of the wicket through the point or cover-point area. The batsman steps forward with the front foot towards the line, opens the bat face slightly, hits from high to low with a partial horizontal arc (more like a controlled cut-drive hybrid), and follows through over the shoulder while keeping the head steady and weight forward.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'Thick edge to gully or slips if the bat face is too open; mistiming can result in a catch at point or cover; requires good timing as playing too early or late can lead to mishits.',
    whenToUse:'Against overpitched or good-length balls wider outside off, especially when the off-side infield is spread or the bowler is offering width. Effective for finding gaps square of the wicket.',
    exponents:'Brian Lara, Graeme Pollock, Sachin Tendulkar, AB de Villiers'
  },
  'BACK FOOT PUNCH':{
    difficulty: '4/10',
    description:'A controlled, aggressive back-foot shot (also called back-foot drive) played to short-of-a-length or back-of-length deliveries around off stump. The batsman transfers weight onto the back foot, moves across slightly towards the off side, keeps the bat straight or slightly angled, punches through the line with a short, crisp follow-through, accelerating the bat at contact for power while keeping the ball down.',
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'Playing away from the body can cause edges to the slips; mistimed punches may pop up for catches at short cover or mid-off; vulnerable to late movement or extra bounce.',
    whenToUse:"Against pace bowlers offering width or length on or outside off stump on good pitches, ideal for scoring quickly through the off side when the front foot isn't needed. Great for rotating strike or punishing loose balls.",
    exponents:'Virat Kohli, Kane Williamson, Rahul Dravid, Joe Root'
  },
  'UPPER CUT':{
    difficulty: '6/10',
    description:"An aggressive shot played to short-pitched deliveries rising outside off stump or bouncers. The batsman rocks back, drops the back elbow slightly to get under the ball, opens the bat face, and cuts upward with a horizontal bat to loft the ball over the slips, wicketkeeper, or third man, using the bowler's pace for elevation.",
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'High risk of top edge to third man, gully, or fine leg if mistimed; gloves or bat can be exposed leading to catches behind; inconsistent bounce makes control difficult.',
    whenToUse:'Against fast bowlers dropping short and wide, especially when third man or slips are up or vacant, common in limited-overs cricket to counter bouncers and score quick boundaries.',
    exponents:'Sachin Tendulkar, Virender Sehwag, David Warner, Yashasvi Jaiswal'
  },
  'LEG GLANCE':{
    difficulty: '4/10',
    description:"A delicate, wristy shot (also called fine glance or deflection) played to balls on or around leg stump or drifting down the leg side. The batsman can play it off front or back foot by getting in line, keeping the head over the ball, and using soft hands and wrists to deflect/flick the ball fine towards fine leg or square leg, often using the bowler's pace rather than generating power.",
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'Leading edge back to the bowler or mid-wicket; lbw if playing across the line and missing; can be aerial if wrists are overused or timing is off.',
    whenToUse:'Against leg-side deliveries from pace or spin, especially when fine leg is up or the bowler is straying onto the pads. Excellent for rotating strike and scoring easy runs with minimal risk.',
    exponents:'VVS Laxman, Rahul Dravid, Kumar Sangakkara, Shivnarine Chanderpaul'
  },
  'LATE CUT': {
    difficulty: '5/10',
    description:"A delicate, back-foot cut shot played with a horizontal bat to short, wide deliveries outside off stump. The batsman rocks back, transfers weight to the back foot, moves the back foot across towards off stump, keeps the head still and close to the line, watches the ball onto the bat very late (often almost behind the body or off the back hip), opens the bat face at the last moment, and uses soft hands and wrists to guide/deflect the ball fine towards third man or backward point, relying heavily on the bowler's pace rather than generating power.",
    imageUrl: require('../../../assets/tutorials/Pullshot.png'),
    videoUrl:'',
    risks:'Mistiming can lead to a thick edge to slips, gully, or keeper; playing too early risks a catch at point or cover; cramped for room if the ball is too close to the body or on middle/leg stump; top edge if wrists are overactive; vulnerable to extra bounce or seam movement.',
    whenToUse:'Against short-of-a-length or back-of-length balls wide outside off stump from pace bowlers or spinners, particularly when third man or gully is up/vacant, no slip fielder, or to rotate strike finely. Excellent for placement and control on turning or seaming pitches.',
    exponents:'Joe Root, Ian Bell, Mahela Jayawardene'
  }

};

//when details are not provided for a shot
const CricketDetail = ({ techniqueName, onBack }: any) => {
  const title = techniqueName?.toUpperCase() || 'UNKNOWN';
  
  const data = CRICKET_DATA[title] || { 
    difficulty: 'N/A', 
    description: 'Content coming soon...',
    risks: 'N/A',
    whenToUse: 'N/A',
    exponents: 'N/A'
  };

  //Video Preview 
  const VideoPreview = ({ imageUrl, videoUrl }: { imageUrl?: any, videoUrl?: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handlePress = () => {
      // Only try to open link if videoUrl is not empty
      if (videoUrl && videoUrl !== '') {
        Linking.openURL(videoUrl).catch(err => console.error("Couldn't load page", err));
      }
    };

    return (
      <Pressable
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={() => setIsHovered(true)}
        onPressOut={() => setIsHovered(false)}
        className="w-full h-48 mb-6 rounded-lg overflow-hidden justify-center items-center bg-neutral-500"
      >
        <ImageBackground
          // Handles both local require() and web links (string)
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
          className="w-full h-full justify-center items-center"
          resizeMode="cover"
        >  
          <View 
            className={`w-16 h-11 justify-center items-center rounded-xl transition-colors duration-200 ${
              isHovered ? 'bg-[#FF0000]' : 'bg-black'
            }`}
          >
            <Ionicons name="play" size={24} color="white" className="ml-1" />
          </View>

        </ImageBackground>
      </Pressable>
    );
  };

  
  const DetailSection = ({ label, content }: { label: string, content: string }) => (
    <View className="mb-6">
      <Text className="font-abeezee text-2xl text-primary-dark mb-1 opacity-90 mt-2">{label}</Text>
      <Text className="font-manrope text-base font-semibold text-neutral-900 leading-6 text-justify">
        {content}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <View className="py-4 pb-4 px-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={28} color="#150000" />
        </TouchableOpacity>
        <Text className="font-bebas text-4xl text-primary-dark pt-1">{title}</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 }}>
        
        <View className="flex-row items-center mb-6">
          <Text className="font-bebas text-2xl text-black mr-2">DEGREE OF DIFFICULTY:</Text>
          <View className="bg-accent-yellow px-3 py-1 rounded-md">
            <Text className="font-bold font-manrope text-base">{data.difficulty}</Text>
          </View>
        </View>

        <DetailSection label="DESCRIPTION" content={data.description} />
        <VideoPreview imageUrl={data.imageUrl} videoUrl={data.videoUrl} />
        <DetailSection label="RISKS" content={data.risks} />
        <DetailSection label="WHEN TO USE" content={data.whenToUse} />

        <View className="my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Text className="font-bebas text-xl text-primary-dark mb-3">BEST EXPONENTS</Text>
          {data.exponents !== 'N/A' ? (
            data.exponents.split(',').map((exponent: string, index: number) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-primary-dark mr-2 text-lg leading-5">•</Text>
                <Text className="font-manrope text-base text-neutral-900 italic flex-1">
                  {exponent.trim()}
                </Text>
              </View>
            ))
          ) : (
            <Text className="font-manrope text-base text-neutral-900 italic">N/A</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CricketDetail;