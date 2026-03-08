import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Data Structure 
const BADMINNTON_DATA: Record<string, any> = {
 'SMASH':{
    difficulty: '7/10', 
    description: "The smash is the most powerful attacking shot in badminton, played overhead from the mid-to-rear court with a full swing. Using a forehand grip (or backhand for backhand smash), the player adopts a sideways stance, jumps (for jump smash) or lunges forward, rotates the body explosively (hips, torso, shoulders, then arm and wrist snap), and strikes the shuttle downward steeply with maximum speed and force, aiming to finish the rally. Contact should be high and in front of the body for steepness and power.",
    imageUrl: require('../../../assets/tutorials/Smash.png'),
    videoUrl:'https://youtu.be/DWsHRZFTqtk?si=S2g68dvXaCb2D9Dv',
    risks:'Overhitting can send the shuttle out; mistiming or poor positioning leads to weak smashes or errors; exposes the player if blocked or returned quickly; jump smashes risk landing awkwardly or tiring the player.',
    whenToUse: 'When the opponent lifts the shuttle high to the rear court and you have good position/time for an aggressive downward attack, especially in singles/doubles when the opponent is out of position or defending weakly. Ideal for winning points outright.',
    exponents: 'Viktor Axelsen, Lee Chong Wei, Lin Dan, Kento Momota'
 },
 'CLEAR':{
    difficulty: '4/10', 
    description: "An overhead defensive (or transitional) shot hit high and deep to the opponent's baseline from the rear court. Using forehand or backhand grip, the player gets sideways, transfers weight forward, extends the arm, and whips the racket through with forearm rotation and wrist action to send the shuttle in a high arc (defensive high clear) or flatter/lower (attacking clear) to push the opponent back and regain positioning.",
    imageUrl: require('../../../assets/tutorials/Clear.png'),
    videoUrl:'https://youtu.be/kb8-HdM7NHw?si=wHlixnMuvVhh8RHy',
    risks: 'A short clear invites a smash; too high/deep gives the opponent time to attack; backhand clear is technically harder and weaker if mistimed.',
    whenToUse: 'When under pressure, lifted deep, or needing time to recover to base position—common in singles to force the opponent back and create space. Defensive clears buy recovery time; attacking clears pressure the opponent.',
    exponents: 'Lee Chong Wei, Lin Dan, Viktor Axelsen, Tai Tzu Ying'
 },
 'DROP':{
    difficulty: '6/10', 
    description: "A deceptive overhead shot from the rear court played softly downward to land just over the net (front court). The action mimics the smash or clear (same preparation and swing initiation) but uses a relaxed grip, sliced wrist action, and minimal power at contact to tumble the shuttle softly over the net. Variants include fast drops (check-smash style), slow/stop drops, and cross-court drops for deception.",
    imageUrl: require('../../../assets/tutorials/Drop.png'),
    videoUrl:'https://youtu.be/u--taRfMoTs?si=mfvVWhZdkYDvFGlH',
    risks: 'If not tight enough, opponent reaches easily for a net kill or lift; mistimed slices can float or go into the net; requires excellent disguise to avoid anticipation.',
    whenToUse: 'When the opponent is deep in the rear court expecting a smash or clear—disrupts rhythm, forces movement forward, and creates openings mid-court or for follow-up attacks. Best in controlled rallies or when not in position for a smash.',
    exponents: 'Tai Tzu Ying, Carolina Marin, Viktor Axelsen, Chen Long'
 },
 'NET SHOT': {
    difficulty: '5/10', 
    description: "A delicate forecourt finesse shot played close to the net (forehand or backhand) to drop the shuttle just over the tape and tumble down tightly. The player moves forward quickly, uses a relaxed grip, short/no backswing, soft wrist action, and forward body momentum to guide or spin the shuttle (hairpin, tumbling, spinning variants) as close to the net as possible, often with the racket shaft pointing downward for spin.",
    imageUrl: require('../../../assets/tutorials/Netshot.png'),
    videoUrl:'https://youtu.be/HQ3GUNNximk?si=qaCO_63JBZnjsK6F',
    risks: 'Loose/tight net shots can be intercepted for kills; over-hitting lifts easily for opponent attacks; requires precise touch—too hard floats, too soft hits net; high risk in prolonged net exchanges if opponent is faster.',
    whenToUse: 'When the opponent plays a loose lift or net return, or in front-court battles (especially doubles) to force a lift and gain attacking position. Ideal for tight control, deception, and pressuring the opponent forward while protecting your own position.',
    exponents: 'Tai Tzu Ying, Viktor Axelsen, Carolina Marin, Anthony Sinisuka Ginting. '
 },
 'DRIVE':{
    difficulty: '5/10', 
    description: "The drive is a fast, flat, horizontal attacking/counter-attacking shot played from the mid-court, typically forehand or backhand. The player uses a relaxed forehand/backhand grip, short backswing, quick lunge or step forward, forearm rotation, and strong wrist snap/finger power to whip the racket through horizontally. The shuttle is struck at around waist/chest height with a sidearm motion, sending it low and flat over the net directly to the opponent's mid-court or body, aiming to keep pressure and force an upward return.",
    imageUrl: require('../../../assets/tutorials/Drivebadminton.png'),
    videoUrl:'https://youtu.be/_6hffa-Jmpk?si=cdVuR0aEuOEgAgKN',
    risks: 'If too high or loose, invites a smash; mistimed contact can result in net errors or weak returns; requires excellent reflexes and timing—poor execution leaves you vulnerable to counter-attacks; in doubles, aiming at the body can be blocked or redirected dangerously.',
    whenToUse: "In fast rallies (especially doubles) when the shuttle is at mid-height and low enough to prevent a smash/drop but too low for overheads; to maintain aggression, push the opponent back, disrupt rhythm, or target the body when they're out of position. Great for transitioning to offense or neutralizing pressure.",
    exponents: 'Lee Chong Wei, Viktor Axelsen, Lin Dan, Marcus Fernaldi Gideon, Kevin Sanjaya Sukamuljo'
 },
 'LIFT':{
    difficulty: '4/10', 
    description: "The lift (also called defensive clear or lob from the forecourt) is a defensive/transition shot played from the front/mid-court to send the shuttle high and deep to the opponent's baseline. Using a forehand/backhand grip (often panhandle or bevel for control), the player lunges forward with a strong, controlled step, keeps the torso upright and core engaged, takes the shuttle early/low (near net height), and uses a short, upward whipping motion with forearm rotation, wrist flick, and finger power to propel the shuttle in a high arc. The racket shaft is more vertical in singles for depth, horizontal in doubles for quicker execution; variants include flat/flick lifts for lower trajectory and more attack.",
    imageUrl: require('../../../assets/tutorials/Lift.png'),
    videoUrl:'https://youtu.be/yRLtypZzJ1E?si=ziGK1Tdum_tt7LhA',
    risks: 'Short lifts invite powerful smashes; too flat/low risks interception mid-court; poor lunge or timing leads to weak height/depth or net errors; backhand lifts are technically harder and less powerful if mistimed.',
    whenToUse: 'When under pressure in the forecourt (e.g., after a tight net shot or weak return), to reset the rally, buy recovery time, push the opponent deep, or move them around to exploit footwork/speed. Essential defensively or to neutralize attacks; flick lifts add surprise when the opponent is forward.',
    exponents: 'Tai Tzu Ying, Carolina Marin, Viktor Axelsen, Lee Chong Wei, Anthony Sinisuka Ginting'
 }

};

//when details are not provided for a shot
const BadmintonDetail = ({ techniqueName, onBack }: any) => {
  const title = techniqueName?.toUpperCase() || 'UNKNOWN';
  
  const data = BADMINNTON_DATA[title] || { 
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
        className="w-full  aspect-video rounded-lg overflow-hidden justify-center items-center bg-neutral-500"
      >
        <ImageBackground
          // Handles both local require() and web links (string)
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
          className="w-full h-full justify-center items-center"
          resizeMode="cover"
        >  
          <View 
            className={`w-20 h-14 justify-center items-center rounded-xl transition-colors duration-200 ${
              isHovered ? 'bg-[#FF0000]' : 'bg-neutral-700'
            }`}
          >
            <Ionicons name="play" size={35} color="white" className="ml-1" />
          </View>

        </ImageBackground>
      </Pressable>
    );
  };

  
  const DetailSection = ({ label, content }: { label: string, content: string }) => (
    <View className="my-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <Text className="font-bebas text-2xl text-primary-dark mb-3">{label}</Text>
      <Text className="font-manrope text-base font-semibold text-neutral-900 leading-6 text-justify">
        {content}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary pt-20">
      <View className="pb-2 px-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={40} color="#150000" className='pt-1'/>
        </TouchableOpacity>
        <Text className="font-bebas text-4xl text-primary-dark pt-2">{title}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 }}>
        
        <View className="flex-row items-center mb-4 px-2">
          <Text className="font-bebas text-3xl text-primary-dark mr-4">DEGREE OF DIFFICULTY:</Text>
          <View className="bg-accent-yellow px-3 py-1 rounded-md">
            <Text className="font-bold font-manrope text-lg">{data.difficulty}</Text>
          </View>
        </View>

        <DetailSection label="DESCRIPTION" content={data.description} />
        <VideoPreview imageUrl={data.imageUrl} videoUrl={data.videoUrl} />
        <DetailSection label="RISKS" content={data.risks} />
        <DetailSection label="WHEN TO USE" content={data.whenToUse} />

        <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Text className="font-bebas text-2xl text-primary-dark mb-3">BEST EXPONENTS</Text>
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

export default BadmintonDetail;