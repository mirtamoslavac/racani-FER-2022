using UnityEngine;

namespace Lab3.Helpers
{
    public class EditorFrameRateLimiter : MonoBehaviour
    {
        private void Awake()
        {
#if UNITY_EDITOR
            Application.targetFrameRate = 45;
#endif
        }
    }
}
