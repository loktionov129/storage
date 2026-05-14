using Il2Cpp;
using MelonLoader;
using UnityEngine;

namespace steamMelonMod
{
	public class Main: MelonMod
	{
		internal const string version = "1.0.0";

		public override void OnUpdate()
		{
			      if (Input.GetKeyDown(KeyCode.Q)) Unlock(Achievement.QQ);
            else if (Input.GetKeyDown(KeyCode.T)) Unlock(Achievement.TT);
		}

		void Unlock(Achievement achievement)
		{
	  		AchievementManager.UnlockAchievement(achievement);
			  MelonLogger.Msg($"Unlock#{achievement} ({achievement.ToString()})");
		}
	}
}
